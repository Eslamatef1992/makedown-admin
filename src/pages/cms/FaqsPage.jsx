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
        { key: 'question_en', label: t('faqs.question') },
        { key: 'sort_order', label: t('common.order') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'question', label: t('faqs.question'), bilingual: true, required: true },
        { name: 'answer', label: t('faqs.answer'), bilingual: true, type: 'textarea', required: true },
        { name: 'sortOrder', label: t('common.sortOrder'), type: 'number' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({
        questionEn: row.question_en,
        questionAr: row.question_ar,
        answerEn: row.answer_en,
        answerAr: row.answer_ar,
        sortOrder: row.sort_order,
        isActive: Boolean(row.is_active),
      })}
    />
  );
}
