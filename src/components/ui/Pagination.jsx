import { useTranslation } from 'react-i18next';

/**
 * Prev/Next pager for any table backed by a {rows, total, page, pageSize}
 * list endpoint. Renders nothing when everything fits on one page.
 */
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-espresso-600">
      <span>{t('common.pageOf', { page, total: totalPages })}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-linen-300 px-3 py-1.5 font-medium text-espresso-700 hover:bg-linen-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('common.previous')}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-linen-300 px-3 py-1.5 font-medium text-espresso-700 hover:bg-linen-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
