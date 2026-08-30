import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { getResource, updateResource } from '../../api/adminApi';

const TITLES = {
  'about-us': 'About us',
  'privacy-policy': 'Privacy policy',
  'terms-and-conditions': 'Terms and conditions',
  'return-policy': 'Return policy',
  'how-it-works': 'How it works',
};

export default function CmsPageEditor() {
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    getResource(`/admin/cms/pages/${slug}`)
      .then((page) => {
        setTitle(page.title);
        setContentHtml(page.content_html || '');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateResource(`/admin/cms/pages/${slug}`, { title, contentHtml });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={TITLES[slug] || slug}>
      {loading ? (
        <p className="text-espresso-400">Loading…</p>
      ) : (
        <div className="max-w-3xl rounded-2xl border border-linen-200 bg-white p-6">
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">Page title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">Content (HTML)</span>
            <textarea
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              rows={16}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-carissma-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-carissma-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {saved && <span className="text-sm text-carissma-600">Saved</span>}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
