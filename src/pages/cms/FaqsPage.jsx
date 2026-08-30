import CrudPage from '../generic/CrudPage';

export default function FaqsPage() {
  return (
    <CrudPage
      title="FAQ"
      basePath="/admin/cms/faqs"
      searchable={false}
      columns={[
        { key: 'question', label: 'Question' },
        { key: 'sort_order', label: 'Order' },
        { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: 'question', label: 'Question', required: true },
        { name: 'answer', label: 'Answer', type: 'textarea', required: true },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
      ]}
      toForm={(row) => ({ question: row.question, answer: row.answer, sortOrder: row.sort_order, isActive: Boolean(row.is_active) })}
    />
  );
}
