/* eslint-disable prettier/prettier */
import { ArrowRight, Calendar, Home, MapPin } from "lucide-react";
import {
  formatFloorInfo,
  formatLocation,
  type DemenagementQuoteData,
} from "@/lib/demenagement/quote";

export function isDemenagementQuote(
  data: unknown,
): data is DemenagementQuoteData {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as DemenagementQuoteData).type === "demenagement_devis"
  );
}

type DemenagementQuoteDetailsProps = {
  quote: DemenagementQuoteData;
  variant?: "default" | "card";
};

export function DemenagementQuoteDetails({
  quote,
  variant = "default",
}: DemenagementQuoteDetailsProps) {
  if (variant === "card") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-or-vif/20 bg-or-vif/8 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-or-bronze">
              <Calendar className="h-3.5 w-3.5" />
              Date
            </div>
            <p className="mt-1 font-display text-sm font-semibold text-charbon">
              {quote.moveDate
                ? new Date(quote.moveDate).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-or-vif/20 bg-or-vif/8 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-or-bronze">
              <Home className="h-3.5 w-3.5" />
              Volume
            </div>
            <p className="mt-1 font-display text-sm font-semibold text-charbon">
              {quote.bedrooms} ch. · {quote.livingRooms} salon{quote.livingRooms > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-black/8 bg-white p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                <MapPin className="h-3 w-3" />
                Départ
              </p>
              <p className="mt-1 text-sm font-medium text-charbon leading-snug">
                {formatLocation(quote.departure)}
              </p>
              <p className="mt-0.5 text-xs yolo-muted">
                {formatFloorInfo("", quote.departureFloor)}
              </p>
            </div>
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-or-vif/15 text-or-vif">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="min-w-0 sm:text-right">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700 sm:justify-end">
                <MapPin className="h-3 w-3" />
                Arrivée
              </p>
              <p className="mt-1 text-sm font-medium text-charbon leading-snug">
                {formatLocation(quote.arrival)}
              </p>
              <p className="mt-0.5 text-xs yolo-muted">
                {formatFloorInfo("", quote.arrivalFloor)}
              </p>
            </div>
          </div>
        </div>

        {quote.additionalNotes?.trim() && (
          <div className="rounded-xl border border-dashed border-black/12 bg-[var(--yolo-cream)]/50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-charbon/45">
              Notes client
            </p>
            <p className="mt-1 text-sm text-charbon/75 whitespace-pre-wrap">{quote.additionalNotes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-or-vif/20 bg-or-vif/5 p-4 space-y-2 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-or-vif">
        Devis déménagement structuré
      </p>
      <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Date souhaitée</dt>
          <dd className="font-medium">{quote.moveDate}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Volume</dt>
          <dd className="font-medium">
            {quote.bedrooms} ch. · {quote.livingRooms} salon(s)
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Départ</dt>
          <dd className="font-medium">{formatLocation(quote.departure)}</dd>
          <dd className="text-muted-foreground mt-0.5">
            {formatFloorInfo("", quote.departureFloor)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Arrivée</dt>
          <dd className="font-medium">{formatLocation(quote.arrival)}</dd>
          <dd className="text-muted-foreground mt-0.5">
            {formatFloorInfo("", quote.arrivalFloor)}
          </dd>
        </div>
        {quote.additionalNotes && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Notes</dt>
            <dd className="whitespace-pre-wrap">{quote.additionalNotes}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
