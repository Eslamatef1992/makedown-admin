import { useState } from 'react';
import { updateResource } from '../../api/adminApi';

/**
 * A click-to-flip "Active" switch for use as a DataTable column `render` —
 * saves immediately via PATCH instead of needing the row opened in the
 * Edit modal. Pass it basePath (e.g. '/admin/game-categories'), the row,
 * and the `reload` callback DataTable forwards to render(row, { reload }).
 */
export default function InlineActiveToggle({ basePath, row, reload, field = 'is_active' }) {
  const [saving, setSaving] = useState(false);
  const active = Boolean(row[field]);

  const onClick = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateResource(`${basePath}/${row.id}`, { isActive: !active });
      await reload?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      role="switch"
      aria-checked={active}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-60 ${
        active ? 'bg-carissma-500' : 'bg-linen-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          active ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
        }`}
      />
    </button>
  );
}
