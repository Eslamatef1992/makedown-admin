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

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

// onView is opt-in: pages that don't pass it (the vast majority of the
// admin's CRUD tables) keep the plain "Edit" text link exactly as before.
// A page that passes onView (view + separate edit, like Game Sessions)
// gets an eye icon for onView and onEdit switches to a pencil icon next to
// it, instead of the text link, so the two actions read as a pair.
export default function DataTable({ columns, rows, onView, onEdit, onDelete, onPrint, onReload, loading, emptyLabel }) {
  const { t } = useTranslation();
  const hasActions = Boolean(onView || onEdit || onDelete || onPrint);
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
                      {c.render ? c.render(row, { reload: onReload }) : String(row[c.key] ?? '—')}
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
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          title={t('common.view')}
                          aria-label={t('common.view')}
                          className="me-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-espresso-500 hover:bg-linen-100 hover:text-carissma-600"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      {onEdit && (onView ? (
                        <button
                          onClick={() => onEdit(row)}
                          title={t('common.edit')}
                          aria-label={t('common.edit')}
                          className="me-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-espresso-500 hover:bg-linen-100 hover:text-carissma-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => onEdit(row)} className="me-3 font-medium text-carissma-600 hover:underline">
                          {t('common.edit')}
                        </button>
                      ))}
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
