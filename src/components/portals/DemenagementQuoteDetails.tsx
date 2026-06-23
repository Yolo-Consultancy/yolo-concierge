/* eslint-disable prettier/prettier */
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

export function DemenagementQuoteDetails({ quote }: { quote: DemenagementQuoteData }) {
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
          <dd className="text-muted-foreground mt-0.5">{formatFloorInfo("", quote.departureFloor)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Arrivée</dt>
          <dd className="font-medium">{formatLocation(quote.arrival)}</dd>
          <dd className="text-muted-foreground mt-0.5">{formatFloorInfo("", quote.arrivalFloor)}</dd>
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
