/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fetchPublicReviews, type PublicReview, type PublicReviewsResponse } from "@/lib/ratings";

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatReviewDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

function clientInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "C";
}

function displayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[0] || "Client";
}

function StarRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${score} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(score) ? "fill-amber-400 text-amber-400" : "text-white/15"}`}
        />
      ))}
    </div>
  );
}

function GoogleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <article className="h-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#151515_0%,#090909_100%)] p-6 shadow-[0_18px_50px_-24px_rgba(125,211,252,0.35)]">
      <div className="flex items-start gap-4">
        {review.photoUri ? (
          <img
            src={review.photoUri}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7dd3fc]/15 text-sm font-semibold text-[#7dd3fc]">
            {clientInitial(review.clientName)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-white">{displayName(review.clientName)}</p>
            <p className="text-xs text-white/45">{formatReviewDate(review.submittedAt)}</p>
          </div>
          <div className="mt-2">
            <StarRow score={review.score} />
          </div>
        </div>
      </div>
      <blockquote className="mt-5 text-sm leading-relaxed text-white/75">
        &ldquo;{review.comment}&rdquo;
      </blockquote>
    </article>
  );
}

export function ClientReviewsSection() {
  const [data, setData] = useState<PublicReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicReviews()
      .then(setData)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Impossible de charger les avis");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const reviews = data?.reviews ?? [];
  const averageScore = data?.averageScore ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const isGoogle = data?.source === "google" || data?.source === "mixed";

  return (
    <section id="avis" className="py-24 px-6 bg-black">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.4em] text-[#7dd3fc] mb-4">Témoignages</p>
          <h2 className="font-display text-4xl md:text-6xl mb-4">Ce Que Disent Nos Clients</h2>
          <p className="text-white/65 text-lg max-w-2xl mx-auto">
            Vrais avis de vrais clients qui ont vécu notre service de location de voitures de luxe
          </p>
        </div>

        {error && (
          <p className="mb-8 text-center text-sm text-red-400/90 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            {error}
          </p>
        )}

        <div className="mx-auto mb-12 max-w-xl rounded-[32px] border border-white/10 bg-[#0f0f11] p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2">
              <GoogleLogo />
              <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                {isGoogle ? "Avis Google Vérifiés" : "Avis Clients Vérifiés"}
              </span>
            </div>
          </div>
          <p className="font-display text-5xl text-[#7dd3fc] mb-2">
            {loading ? "—" : averageScore > 0 ? averageScore.toFixed(1) : "—"}
          </p>
          <div className="mb-3 flex justify-center">
            {averageScore > 0 && <StarRow score={averageScore} />}
          </div>
          <p className="text-sm text-white/55">
            {loading
              ? "Chargement des avis..."
              : totalCount > 0
                ? `Basé sur ${totalCount} avis`
                : "Aucun avis pour le moment"}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-sm text-white/45 rounded-[28px] border border-dashed border-white/15 py-16">
            Les avis clients apparaîtront ici après les évaluations post-course.
          </p>
        ) : (
          <div className="relative px-2 md:px-12">
            <Carousel opts={{ align: "start", loop: reviews.length > 3 }} className="w-full">
              <CarouselContent className="-ml-4">
                {reviews.map((review) => (
                  <CarouselItem key={review.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <ReviewCard review={review} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 border-white/15 bg-[#0f0f11] text-white hover:bg-white/10 hover:text-[#7dd3fc] disabled:opacity-30" />
              <CarouselNext className="right-0 border-white/15 bg-[#0f0f11] text-white hover:bg-white/10 hover:text-[#7dd3fc] disabled:opacity-30" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
