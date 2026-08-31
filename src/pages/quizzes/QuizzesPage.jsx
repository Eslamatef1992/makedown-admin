import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import BilingualField from '../../components/ui/BilingualField';
import ImageField from '../../components/ui/ImageField';
import { listResource, getResource, createResource, updateResource, deleteResource, uploadImage } from '../../api/adminApi';
import { findMissingField } from '../../utils/validateFields';

// MySQL's JSON-typed columns (options_json_en/options_json_ar) come back
// from the API already deserialized into real arrays in most cases, but
// guard for a plain JSON string too so this never crashes either way.
const parseOptions = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return [];
    }
  }
  return [];
};

const EMPTY_QUESTION = {
  questionTextEn: '',
  questionTextAr: '',
  optionsEn: ['', '', '', ''],
  optionsAr: ['', '', '', ''],
  correctOptionIndex: 0,
  points: 200,
  timeLimitSeconds: 20,
  questionType: 'text',
  mode: 'both',
  mediaUrl: '',
};

const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio (listening)' },
  { value: 'qr', label: 'QR-gated' },
];

const QUESTION_MODES = [
  { value: 'both', label: 'Solo & Team' },
  { value: 'solo', label: 'Solo only' },
  { value: 'team', label: 'Team only' },
];

const QUESTION_POINT_VALUES = [200, 400, 600];

export default function QuizzesPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [qForm, setQForm] = useState(EMPTY_QUESTION);
  const [mediaUploading, setMediaUploading] = useState(false);

  const bilingualQuizFields = [
    { name: 'title', label: t('common.name'), bilingual: true, required: true },
    { name: 'description', label: t('common.description'), bilingual: true, type: 'textarea', required: false },
  ];
  const quizFields = [
    {
      name: 'categoryId',
      label: t('quizzes.category'),
      type: 'select',
      options: categories.map((c) => ({ value: String(c.id), label: c.name_en })),
    },
    {
      name: 'difficulty',
      label: t('quizzes.difficulty'),
      type: 'select',
      options: [
        { value: 'easy', label: t('quizzes.easy') },
        { value: 'medium', label: t('quizzes.medium') },
        { value: 'hard', label: t('quizzes.hard') },
      ],
    },
    {
      name: 'supportedModes',
      label: t('quizzes.supportedModes'),
      type: 'select',
      options: [
        { value: 'both', label: t('quizzes.modeBoth') },
        { value: 'solo', label: t('quizzes.modeSolo') },
        { value: 'team', label: t('quizzes.modeTeam') },
      ],
    },
    { name: 'coverImageUrl', label: t('quizzes.coverImageUrl'), type: 'image' },
    { name: 'isActive', label: t('common.active'), type: 'checkbox' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource('/admin/quizzes', search ? { search } : {});
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    listResource('/admin/game-categories', { pageSize: 200 })
      .then((result) => setCategories(result.rows || []))
      .catch(() => setCategories([]));
  }, []);

  const openCreate = () => { setEditing(null); setForm({ categoryId: '', supportedModes: 'both' }); setError(''); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      titleEn: row.title_en, titleAr: row.title_ar,
      descriptionEn: row.description_en, descriptionAr: row.description_ar,
      categoryId: row.category_id ? String(row.category_id) : '',
      difficulty: row.difficulty,
      supportedModes: row.supported_modes || 'both',
      coverImageUrl: row.cover_image_url, isActive: Boolean(row.is_active),
    });
    setError('');
    setModalOpen(true);
  };
  const onSave = async () => {
    if (findMissingField([...bilingualQuizFields, ...quizFields], form)) {
      setError(t('common.fillRequired'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) await updateResource(`/admin/quizzes/${editing.id}`, form);
      else await createResource('/admin/quizzes', form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSaving(false);
    }
  };
  const onDelete = async (row) => {
    if (!confirm(t('quizzes.confirmDelete'))) return;
    await deleteResource(`/admin/quizzes/${row.id}`);
    load();
  };

  const openDetail = async (row) => {
    setDetail(await getResource(`/admin/quizzes/${row.id}`));
    setDetailOpen(true);
  };

  const setOption = (lang, index, value) => {
    setQForm((f) => {
      const key = lang === 'en' ? 'optionsEn' : 'optionsAr';
      const options = [...f[key]];
      options[index] = value;
      return { ...f, [key]: options };
    });
  };

  const addQuestion = async () => {
    const filledEn = qForm.optionsEn.filter((o) => o.trim()).length;
    const filledAr = qForm.optionsAr.filter((o) => o.trim()).length;
    if (!qForm.questionTextEn.trim() || !qForm.questionTextAr.trim()) return alert(t('quizzes.questionTextBothRequired'));
    if (filledEn < 2 || filledAr < 2) return alert(t('quizzes.minOptionsAlert'));
    try {
      await createResource(`/admin/quizzes/${detail.id}/questions`, qForm);
      setQForm(EMPTY_QUESTION);
      setDetail(await getResource(`/admin/quizzes/${detail.id}`));
    } catch (err) {
      alert(err.response?.data?.message || t('common.somethingWentWrong'));
    }
  };

  const deleteQuestion = async (questionId) => {
    await deleteResource(`/admin/quizzes/${detail.id}/questions/${questionId}`);
    setDetail(await getResource(`/admin/quizzes/${detail.id}`));
  };

  return (
    <AdminLayout title={t('quizzes.title')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')}
          className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
        />
        <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
          {t('common.addNew')}
        </button>
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          {
            key: 'cover_image_url',
            label: t('quizzes.coverImageUrl'),
            render: (r) =>
              r.cover_image_url ? (
                <img src={r.cover_image_url} alt="" className="h-10 w-10 rounded-lg border border-linen-200 object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-linen-300 text-xs text-espresso-300">—</span>
              ),
          },
          { key: 'title_en', label: t('common.name') },
          {
            key: 'category_id',
            label: t('quizzes.category'),
            render: (r) => categories.find((c) => c.id === r.category_id)?.name_en || t('quizzes.noCategory'),
          },
          { key: 'difficulty', label: t('quizzes.difficulty') },
          {
            key: 'supported_modes',
            label: t('quizzes.supportedModes'),
            render: (r) => {
              const labels = { solo: t('quizzes.modeSolo'), team: t('quizzes.modeTeam'), both: t('quizzes.modeBoth') };
              return labels[r.supported_modes] || labels.both;
            },
          },
          {
            key: 'questions',
            label: t('quizzes.questions'),
            render: (r) => <button onClick={() => openDetail(r)} className="font-medium text-carissma-600 hover:underline">{t('common.manage')}</button>,
          },
          { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
        ]}
        onEdit={openEdit}
        onDelete={onDelete}
      />

      <Modal
        open={modalOpen}
        title={editing ? t('quizzes.editGame') : t('quizzes.addGame')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-linen-100">{t('common.cancel')}</button>
            <button onClick={onSave} disabled={saving} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700 disabled:opacity-60">{saving ? t('common.saving') : t('common.save')}</button>
          </>
        }
      >
        {error && <p className="mb-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
        {bilingualQuizFields.map((f) => (
          <BilingualField key={f.name} field={f} form={form} onChange={(name, v) => setForm((s) => ({ ...s, [name]: v }))} />
        ))}
        {quizFields.map((f) => {
          const change = (name, v) => setForm((s) => ({ ...s, [name]: v }));
          return f.type === 'image' ? (
            <ImageField key={f.name} field={f} value={form[f.name]} onChange={change} />
          ) : (
            <Field key={f.name} field={f} value={form[f.name]} onChange={change} />
          );
        })}
      </Modal>

      <Modal open={detailOpen} title={detail ? t('quizzes.questionsFor', { title: detail.title_en }) : ''} onClose={() => setDetailOpen(false)}>
        {detail && (
          <div className="space-y-4">
            <div className="rounded-xl border border-linen-200">
              {(detail.questions || []).map((q) => (
                <div key={q.id} className="flex items-start gap-3 border-b border-linen-100 px-4 py-3 text-sm last:border-0">
                  {(q.question_type === 'image' || q.question_type === 'qr') && q.media_url ? (
                    <img src={q.media_url} alt="" className="h-12 w-12 flex-none rounded-lg border border-linen-200 object-cover" />
                  ) : q.question_type === 'audio' && q.media_url ? (
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-lg border border-linen-200 bg-linen-50 text-lg text-espresso-400">🔊</span>
                  ) : null}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-espresso-800">{q.question_text_en}</p>
                      <span className="rounded-full bg-linen-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-espresso-500">
                        {q.points} pts · {{ solo: 'Solo', team: 'Team', both: 'Solo & Team' }[q.mode] || 'Solo & Team'}
                      </span>
                    </div>
                    <p dir="rtl" className="text-espresso-700">{q.question_text_ar}</p>
                    <p className="text-espresso-500">
                      {parseOptions(q.options_json_en).map((o, i) => `${i === q.correct_option_index ? '✓ ' : ''}${o}`).join(' · ')}
                    </p>
                  </div>
                  <button onClick={() => deleteQuestion(q.id)} className="shrink-0 font-medium text-carnation-600 hover:underline">{t('common.delete')}</button>
                </div>
              ))}
              {(detail.questions || []).length === 0 && <p className="p-4 text-sm text-espresso-400">{t('quizzes.noQuestions')}</p>}
            </div>

            <div className="space-y-2 rounded-xl bg-linen-50 p-4">
              <div className="flex flex-wrap gap-2">
                {QUESTION_TYPES.map((qt) => (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => setQForm((f) => ({ ...f, questionType: qt.value }))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      qForm.questionType === qt.value
                        ? 'border-carissma-500 bg-carissma-600 text-white'
                        : 'border-linen-300 text-espresso-600 hover:border-carissma-300'
                    }`}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {QUESTION_MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setQForm((f) => ({ ...f, mode: m.value }))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      qForm.mode === m.value
                        ? 'border-espresso-500 bg-espresso-700 text-white'
                        : 'border-linen-300 text-espresso-600 hover:border-espresso-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <input
                placeholder={`${t('quizzes.questionText')} — ${t('common.english')}`}
                value={qForm.questionTextEn}
                dir="ltr"
                onChange={(e) => setQForm((f) => ({ ...f, questionTextEn: e.target.value }))}
                className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
              <input
                placeholder={`${t('quizzes.questionText')} — ${t('common.arabic')}`}
                value={qForm.questionTextAr}
                dir="rtl"
                onChange={(e) => setQForm((f) => ({ ...f, questionTextAr: e.target.value }))}
                className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />

              {(qForm.questionType === 'image' || qForm.questionType === 'audio' || qForm.questionType === 'qr') && (
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-espresso-600">
                    {qForm.questionType === 'image' ? 'Question image' : qForm.questionType === 'qr' ? 'QR code image' : 'Audio clip'}
                  </span>
                  {qForm.mediaUrl && (
                    <div className="mb-2 flex items-center gap-3">
                      {qForm.questionType === 'audio' ? (
                        <audio controls src={qForm.mediaUrl} className="h-9" />
                      ) : (
                        <img src={qForm.mediaUrl} alt="" className="h-16 w-16 rounded-xl border border-linen-200 object-cover" />
                      )}
                      <button type="button" onClick={() => setQForm((f) => ({ ...f, mediaUrl: '' }))} className="text-xs font-medium text-carnation-600 hover:underline">
                        {t('common.remove')}
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept={qForm.questionType === 'audio' ? 'audio/*' : 'image/*'}
                    disabled={mediaUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setMediaUploading(true);
                      try {
                        const url = await uploadImage(file);
                        setQForm((f) => ({ ...f, mediaUrl: url }));
                      } finally {
                        setMediaUploading(false);
                        e.target.value = '';
                      }
                    }}
                    className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm file:me-3 file:rounded-lg file:border-0 file:bg-carissma-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-carissma-700 hover:file:bg-carissma-200"
                  />
                  {mediaUploading && <p className="mt-1 text-xs text-espresso-400">{t('common.uploading')}</p>}
                  {qForm.questionType === 'qr' && (
                    <p className="mt-2 rounded-xl bg-carissma-50 px-3 py-2 text-xs text-carissma-700">
                      Players must scan this QR code before this question's timer starts.
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <select
                  value={qForm.points}
                  onChange={(e) => setQForm((f) => ({ ...f, points: Number(e.target.value) }))}
                  className="w-1/2 rounded-xl border border-linen-300 px-3 py-2 text-sm"
                >
                  {QUESTION_POINT_VALUES.map((p) => (
                    <option key={p} value={p}>{p} points</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={5}
                  placeholder="Time limit (seconds)"
                  value={qForm.timeLimitSeconds}
                  onChange={(e) => setQForm((f) => ({ ...f, timeLimitSeconds: Number(e.target.value) }))}
                  className="w-1/2 rounded-xl border border-linen-300 px-3 py-2 text-sm"
                />
              </div>

              {qForm.optionsEn.map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={qForm.correctOptionIndex === i}
                    onChange={() => setQForm((f) => ({ ...f, correctOptionIndex: i }))}
                  />
                  <input
                    placeholder={`${t('quizzes.option', { n: i + 1 })} (${t('common.english')})`}
                    value={qForm.optionsEn[i]}
                    dir="ltr"
                    onChange={(e) => setOption('en', i, e.target.value)}
                    className="flex-1 rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder={`${t('quizzes.option', { n: i + 1 })} (${t('common.arabic')})`}
                    value={qForm.optionsAr[i]}
                    dir="rtl"
                    onChange={(e) => setOption('ar', i, e.target.value)}
                    className="flex-1 rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <p className="text-xs text-espresso-400">{t('quizzes.correctHint')}</p>
              <button onClick={addQuestion} className="w-full rounded-xl bg-carissma-600 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
                {t('quizzes.addQuestion')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
