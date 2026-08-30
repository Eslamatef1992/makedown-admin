import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadImage } from '../../api/adminApi';

const ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,image/avif,image/x-icon,.svg,.png,.jpg,.jpeg,.gif,.webp,.avif,.ico';

/**
 * Upload-driven image field: shows a preview of the current image (if any),
 * a file picker that uploads immediately on selection via POST
 * /admin/uploads/image, and writes the returned URL into the form via
 * onChange. Replaces the old plain-text "paste a URL" inputs.
 */
export default function ImageField({ field, value, onChange }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file);
      onChange(field.name, url);
    } catch (err) {
      setError(err.response?.data?.message || t('common.uploadFailed'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const clear = () => onChange(field.name, '');

  return (
    <div className="mb-4">
      <span className="mb-1.5 block text-sm font-medium text-espresso-800">{field.label}</span>
      {value ? (
        <div className="mb-2 flex items-center gap-3">
          <img src={value} alt="" className="h-16 w-16 rounded-xl border border-linen-200 object-cover" />
          <button type="button" onClick={clear} className="text-sm font-medium text-carnation-600 hover:underline">
            {t('common.remove')}
          </button>
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={onFileChange}
        disabled={uploading}
        className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm text-espresso-900 file:me-3 file:rounded-lg file:border-0 file:bg-carissma-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-carissma-700 hover:file:bg-carissma-200 focus:outline-none focus:ring-2 focus:ring-carissma-500 disabled:opacity-60"
      />
      {uploading && <p className="mt-1.5 text-xs text-espresso-400">{t('common.uploading')}</p>}
      {error && <p className="mt-1.5 text-xs text-carnation-600">{error}</p>}
    </div>
  );
}
