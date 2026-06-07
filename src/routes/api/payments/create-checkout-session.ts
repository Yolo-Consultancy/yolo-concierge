import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";

interface BookingPayload {
  id?: string;
  vehicleName?: string;
  vehicleId?: string;
  days?: number;
  totalPrice?: number;
  withChauffeur?: boolean;
  clientName?: string;
  clientEmail?: string;
}

interface Body {
  booking: BookingPayload;
  successUrl: string;
  cancelUrl: string;
  currency?: string;
}

export const Route = createFileRoute("/api/payments/create-checkout-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_SECRET_KEY;
        if (!secret) {
          return Response.json(
            { error: "STRIPE_SECRET_KEY non configurée." },
            { status: 500 },
          );
        }
        const mode = (process.env.STRIPE_MODE ?? "").toLowerCase();
        const looksLive = secret.startsWith("sk_live_");
        const looksTest = secret.startsWith("sk_test_");
        if (mode === "live" && !looksLive) {
          return Response.json(
            { error: "STRIPE_MODE=live mais la clé n'est pas une clé live (sk_live_…)." },
            { status: 500 },
          );
        }
        if (mode === "test" && !looksTest) {
          return Response.json(
            { error: "STRIPE_MODE=test mais la clé n'est pas une clé test (sk_test_…)." },
            { status: 500 },
          );
        }

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Corps JSON invalide." }, { status: 400 });
        }

        const { booking, successUrl, cancelUrl, currency = "usd" } = body ?? {};
        if (!booking || !successUrl || !cancelUrl) {
          return Response.json({ error: "Paramètres manquants." }, { status: 400 });
        }

        const amount = Math.round(Number(booking.totalPrice ?? 0) * 100);
        if (!Number.isFinite(amount) || amount < 50) {
          return Response.json(
            { error: "Montant invalide (minimum 0.50)." },
            { status: 400 },
          );
        }

        const stripe = new Stripe(secret);

        try {
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency,
                  product_data: {
                    name: `YOLO — ${booking.vehicleName ?? "Réservation"}`,
                    description: `${booking.days ?? 1} jour(s)${
                      booking.withChauffeur ? " · avec chauffeur" : ""
                    }`,
                  },
                  unit_amount: amount,
                },
                quantity: 1,
              },
            ],
            customer_email: booking.clientEmail || undefined,
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&booking=${encodeURIComponent(booking.id ?? "")}`,
            cancel_url: `${cancelUrl}?booking=${encodeURIComponent(booking.id ?? "")}`,
            metadata: {
              bookingId: booking.id ?? "",
              vehicleId: booking.vehicleId ?? "",
              clientName: booking.clientName ?? "",
            },
          });
          return Response.json({ url: session.url, id: session.id, mode: looksLive ? "live" : "test" });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erreur Stripe";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
