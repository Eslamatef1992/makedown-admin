import { useTranslation } from 'react-i18next';
import Field from './Field';

/**
 * Renders one logical content field (e.g. "name", "description") as a
 * required English/Arabic pair, per the "every customer-facing field needs
 * both languages" rule. `field.name` is the base key ("name") — the actual
 * form fields are `${name}En` / `${name}Ar`, matching the API's bilingual
 * body contract (see makedown-api src/utils/bilingual.js).
 *
 * props:
 *  - field: { name, label, type?, rows?, required? } (required defaults to true)
 *  - form: the full form state object
 *  - onChange(name, value): same signature as Field's onChange
 */
export default function BilingualField({ field, form, onChange }) {
  const { t } = useTranslation();
  const enName = `${field.name}En`;
  const arName = `${field.name}Ar`;
  const required = field.required !== false;

  const enField = { ...field, name: enName, label: `${field.label} — ${t('common.english')}`, required, dir: 'ltr' };
  const arField = { ...field, name: arName, label: `${field.label} — ${t('common.arabic')}`, required, dir: 'rtl' };

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field field={enField} value={form[enName]} onChange={onChange} />
      <Field field={arField} value={form[arName]} onChange={onChange} />
    </div>
  );
}
