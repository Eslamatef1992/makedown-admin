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

const EMPTY_QUESTION = {
  questionTextEn: '',
  questionTextAr: '',
  optionsEn: ['', '', '', ''],
  optionsAr: ['', '', '', ''],
  correctOptionIndex: 0,
  points: 100,
  timeLimitSeconds: 20,
  questionType: 'text',
  mediaUrl: '',
};

const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio (listening)' },
  { value: 'qr', label: 'QR-gated' },
];

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
      name: 'difficulty',
      label: t('quizzes.difficulty'),
      type: 'select',
      options: [
        { value: 'easy', label: t('quizzes.easy') },
        { value: 'medium', label: t('quizzes.medium') },
        { value: 'hard', label: t('quizzes.hard') },
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

  const openCreate = () => { setEditing(null); setForm({}); setError(''); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      titleEn: row.title_en, titleAr: row.title_ar,
      descriptionEn: row.description_en, descriptionAr: row.description_ar,
      difficulty: row.difficulty,
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
          { key: 'title_en', label: t('common.name') },
          { key: 'difficulty', label: t('quizzes.difficulty') },
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
                <div key={q.id} className="flex items-start justify-between border-b border-linen-100 px-4 py-3 text-sm last:border-0">
                  <div>
                    <p className="font-medium text-espresso-800">{q.question_text_en}</p>
                    <p dir="rtl" className="text-espresso-700">{q.question_text_ar}</p>
                    <p className="text-espresso-500">
                      {JSON.parse(q.options_json_en).map((o, i) => `${i === q.correct_option_index ? '✓ ' : ''}${o}`).join(' · ')}
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

              {(qForm.questionType === 'image' || qForm.questionType === 'audio') && (
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-espresso-600">
                    {qForm.questionType === 'image' ? 'Question image' : 'Audio clip'}
                  </span>
                  {qForm.mediaUrl && (
                    <div className="mb-2 flex items-center gap-3">
                      {qForm.questionType === 'image' ? (
                        <img src={qForm.mediaUrl} alt="" className="h-16 w-16 rounded-xl border border-linen-200 object-cover" />
                      ) : (
                        <audio controls src={qForm.mediaUrl} className="h-9" />
                      )}
                      <button type="button" onClick={() => setQForm((f) => ({ ...f, mediaUrl: '' }))} className="text-xs font-medium text-carnation-600 hover:underline">
                        {t('common.remove')}
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept={qForm.questionType === 'image' ? 'image/*' : 'audio/*'}
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
                </div>
              )}
              {qForm.questionType === 'qr' && (
                <p className="rounded-xl bg-carissma-50 px-3 py-2 text-xs text-carissma-700">
                  Players must scan a QR code shown on screen before this question's timer starts — no extra media needed.
                </p>
              )}

              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Points"
                  value={qForm.points}
                  onChange={(e) => setQForm((f) => ({ ...f, points: Number(e.target.value) }))}
                  className="w-1/2 rounded-xl border border-linen-300 px-3 py-2 text-sm"
                />
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
