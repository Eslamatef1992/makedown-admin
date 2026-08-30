export default function DataTable({ columns, rows, onEdit, onDelete, loading, emptyLabel = 'No records yet' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-linen-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-linen-50 text-espresso-600">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-espresso-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-espresso-400">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={row.id} className="border-t border-linen-100 hover:bg-linen-50/60">
                  {columns.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-4 py-3 text-espresso-800">
                      {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="mr-3 font-medium text-carissma-600 hover:underline">
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} className="font-medium text-carnation-600 hover:underline">
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
