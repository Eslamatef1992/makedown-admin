import { useTranslation } from 'react-i18next';

function PrinterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
    </svg>
  );
}

export default function DataTable({ columns, rows, onEdit, onDelete, onPrint, loading, emptyLabel }) {
  const { t } = useTranslation();
  const hasActions = Boolean(onEdit || onDelete || onPrint);
  return (
    <div className="overflow-hidden rounded-2xl border border-linen-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead className="bg-linen-50 text-espresso-600">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
              {hasActions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-espresso-400">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-espresso-400">
                  {emptyLabel ?? t('common.noRecords')}
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
                  {hasActions && (
                    <td className="whitespace-nowrap px-4 py-3 text-end">
                      {onPrint && (
                        <button
                          onClick={() => onPrint(row)}
                          title={t('common.print')}
                          aria-label={t('common.print')}
                          className="me-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-espresso-500 hover:bg-linen-100 hover:text-carissma-600"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="me-3 font-medium text-carissma-600 hover:underline">
                          {t('common.edit')}
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} className="font-medium text-carnation-600 hover:underline">
                          {t('common.delete')}
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
