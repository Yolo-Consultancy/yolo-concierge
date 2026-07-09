/* eslint-disable prettier/prettier */

type Props = {
  count: number;
  alert?: boolean;
  active?: boolean;
};

export function NavCountBadge({ count, alert, active }: Props) {
  if (count <= 0) return null;

  return (
    <span
      className={`ml-auto min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0 ${
        active
          ? alert
            ? "bg-black/25 text-black"
            : "bg-black/15 text-black/80"
          : alert
            ? "bg-amber-500 text-black"
            : "bg-white/15 text-white"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
