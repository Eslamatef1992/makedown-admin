import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { getResource, putResource } from '../../api/adminApi';

function ToggleRow({ label, hint, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-linen-100 py-5 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-espresso-900">{label}</p>
        {hint && <p className="mt-1 text-xs text-espresso-500">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          checked ? 'bg-carissma-500' : 'bg-linen-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default function CashOnDeliveryPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({ products: true, packages: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getResource('/admin/site-settings/cash-on-delivery')
      .then((data) => data && setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    setSaving(true);
    setMessage('');
    try {
      const saved = await putResource('/admin/site-settings/cash-on-delivery', { [key]: value });
      setSettings(saved);
      setMessage(t('cms.saved'));
    } catch {
      // Revert on failure so the toggle doesn't lie about what's actually saved.
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={t('nav.cashOnDelivery')}>
      <div className="max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-espresso-600">{t('cashOnDelivery.intro')}</p>

        <div className="mt-4">
          <ToggleRow
            label={t('cashOnDelivery.products')}
            hint={t('cashOnDelivery.productsHint')}
            checked={Boolean(settings.products)}
            disabled={loading || saving}
            onChange={(v) => toggle('products', v)}
          />
          <ToggleRow
            label={t('cashOnDelivery.packages')}
            hint={t('cashOnDelivery.packagesHint')}
            checked={Boolean(settings.packages)}
            disabled={loading || saving}
            onChange={(v) => toggle('packages', v)}
          />
        </div>

        {message && <p className="mt-4 rounded-xl bg-carissma-50 px-3 py-2 text-sm text-carissma-700">{message}</p>}
      </div>
    </AdminLayout>
  );
}
