/**
 * Client-side required-field check for the generic Field/BilingualField
 * form config shape. This exists because the create/edit modals aren't
 * native <form> submissions (the Save button is a plain onClick handler),
 * so the HTML `required` attribute on inputs is never actually enforced
 * by the browser — without this, a field marked required could be left
 * blank and only get caught (confusingly) by a raw DB error.
 *
 * Returns the first field that's missing a value, or null if everything
 * required is filled in. Checkbox fields are skipped (false is valid).
 */
export function findMissingField(fields, form) {
  for (const field of fields) {
    if (field.type === 'checkbox') continue;

    if (field.bilingual) {
      if (field.required === false) continue;
      const en = form[`${field.name}En`];
      const ar = form[`${field.name}Ar`];
      if (!String(en ?? '').trim() || !String(ar ?? '').trim()) return field;
      continue;
    }

    if (field.required) {
      const val = form[field.name];
      if (!String(val ?? '').trim()) return field;
    }
  }
  return null;
}
