import { useTranslation } from 'react-i18next';

export default function Field({ field, value, onChange }) {
  const { t } = useTranslation();
  const common = {
    id: field.name,
    name: field.name,
    value: value ?? '',
    onChange: (e) => onChange(field.name, field.type === 'checkbox' ? e.target.checked : e.target.value),
    className:
      'w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-500',
    placeholder: field.placeholder,
    required: field.required,
  };

  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium text-espresso-800">{field.label}</span>
      {field.type === 'textarea' && <textarea {...common} rows={field.rows || 4} />}
      {field.type === 'select' && (
        <select {...common}>
          <option value="">{t('common.select')}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {field.type === 'checkbox' && (
        <input
          type="checkbox"
          id={field.name}
          name={field.name}
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="rounded"
        />
      )}
      {!['textarea', 'select', 'checkbox'].includes(field.type) && <input type={field.type || 'text'} {...common} />}
    </label>
  );
}
