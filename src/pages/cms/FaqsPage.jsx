import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

export default function FaqsPage() {
  const { t } = useTranslation();
  return (
    <CrudPage
      title={t('faqs.title')}
      basePath="/admin/cms/faqs"
      searchable={false}
      columns={[
        { key: 'question', label: t('faqs.question') },
        { key: 'sort_order', label: t('common.order') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'question', label: t('faqs.question'), required: true },
        { name: 'answer', label: t('faqs.answer'), type: 'textarea', required: true },
        { name: 'sortOrder', label: t('common.sortOrder'), type: 'number' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({ question: row.question, answer: row.answer, sortOrder: row.sort_order, isActive: Boolean(row.is_active) })}
    />
  );
}
