// A ranked list with direct-labeled, thin horizontal bars -- for "top N by
// magnitude" data (best-selling products, busiest categories) where the
// identity (name) matters as much as the number. One hue per list; no
// legend needed since it's a single series.
export default function RankedBarList({ items, color, valueSuffix = '', emptyLabel }) {
  if (!items || items.length === 0) {
    return <p className="py-10 text-center text-sm text-espresso-400">{emptyLabel}</p>;
  }

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.id ?? item.label} className="flex items-center gap-3">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-linen-100 object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linen-100 text-sm font-semibold text-espresso-500">
              {item.label ? item.label.slice(0, 1).toUpperCase() : '?'}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-espresso-800">{item.label}</span>
              <span className="shrink-0 text-sm font-semibold text-espresso-900">
                {item.value}{valueSuffix ? ` ${valueSuffix}` : ''}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-linen-100">
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: `${Math.max((item.value / maxValue) * 100, 4)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
