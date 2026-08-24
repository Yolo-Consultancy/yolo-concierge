/* eslint-disable prettier/prettier */
import { formatAnalyticsNumber } from "@/components/analytics/StatCard";
import type { AnalyticsPageRow } from "@/lib/analytics/types";

type TopPagesTableProps = {
  pages: AnalyticsPageRow[];
  loading?: boolean;
  showAll?: boolean;
  onShowAll?: () => void;
};

export function TopPagesTable({ pages, loading, showAll, onShowAll }: TopPagesTableProps) {
  const rows = showAll ? pages : pages.slice(0, 10);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Pages les plus consultées</h3>
        {!showAll && pages.length > 10 && onShowAll && (
          <button type="button" onClick={onShowAll} className="text-xs font-medium text-primary hover:underline">
            Voir toutes les pages
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune page consultée sur cette période.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Page</th>
                <th className="pb-2 pr-4 text-right font-medium">Vues</th>
                <th className="pb-2 text-right font-medium">Visiteurs</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((page, index) => (
                <tr key={page.path} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4 text-muted-foreground">{index + 1}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{page.label}</p>
                    <p className="text-xs text-muted-foreground">{page.path}</p>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{formatAnalyticsNumber(page.views)}</td>
                  <td className="py-3 text-right tabular-nums">{formatAnalyticsNumber(page.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
