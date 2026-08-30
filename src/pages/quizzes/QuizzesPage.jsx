import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import { listResource, getResource, createResource, updateResource, deleteResource } from '../../api/adminApi';

const quizFields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'difficulty', label: 'Difficulty', type: 'select', options: [
    { value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' },
  ] },
  { name: 'coverImageUrl', label: 'Cover image URL' },
  { name: 'isActive', label: 'Active', type: 'checkbox' },
];

export default function QuizzesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [qForm, setQForm] = useState({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 100, timeLimitSeconds: 20 });

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

  const openCreate = () => { setEditing(null); setForm({}); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title, description: row.description, difficulty: row.difficulty,
      coverImageUrl: row.cover_image_url, isActive: Boolean(row.is_active),
    });
    setModalOpen(true);
  };
  const onSave = async () => {
    if (editing) await updateResource(`/admin/quizzes/${editing.id}`, form);
    else await createResource('/admin/quizzes', form);
    setModalOpen(false);
    load();
  };
  const onDelete = async (row) => {
    if (!confirm('Delete this game (and its questions)?')) return;
    await deleteResource(`/admin/quizzes/${row.id}`);
    load();
  };

  const openDetail = async (row) => {
    setDetail(await getResource(`/admin/quizzes/${row.id}`));
    setDetailOpen(true);
  };

  const addQuestion = async () => {
    if (qForm.options.filter((o) => o.trim()).length < 2) return alert('Add at least 2 options');
    await createResource(`/admin/quizzes/${detail.id}/questions`, qForm);
    setQForm({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 100, timeLimitSeconds: 20 });
    setDetail(await getResource(`/admin/quizzes/${detail.id}`));
  };

  const deleteQuestion = async (questionId) => {
    await deleteResource(`/admin/quizzes/${detail.id}/questions/${questionId}`);
    setDetail(await getResource(`/admin/quizzes/${detail.id}`));
  };

  return (
    <AdminLayout title="Education — Games">
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
          className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
        />
        <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
          + Add new
        </button>
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'difficulty', label: 'Difficulty' },
          {
            key: 'questions',
            label: 'Questions',
            render: (r) => <button onClick={() => openDetail(r)} className="font-medium text-carissma-600 hover:underline">Manage</button>,
          },
          { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
        ]}
        onEdit={openEdit}
        onDelete={onDelete}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Edit game' : 'Add game'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-linen-100">Cancel</button>
            <button onClick={onSave} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">Save</button>
          </>
        }
      >
        {quizFields.map((f) => (
          <Field key={f.name} field={f} value={form[f.name]} onChange={(name, v) => setForm((s) => ({ ...s, [name]: v }))} />
        ))}
      </Modal>

      <Modal open={detailOpen} title={detail ? `Questions — ${detail.title}` : ''} onClose={() => setDetailOpen(false)}>
        {detail && (
          <div className="space-y-4">
            <div className="rounded-xl border border-linen-200">
              {(detail.questions || []).map((q) => (
                <div key={q.id} className="flex items-start justify-between border-b border-linen-100 px-4 py-3 text-sm last:border-0">
                  <div>
                    <p className="font-medium text-espresso-800">{q.question_text}</p>
                    <p className="text-espresso-500">
                      {JSON.parse(q.options_json).map((o, i) => `${i === q.correct_option_index ? '✓ ' : ''}${o}`).join(' · ')}
                    </p>
                  </div>
                  <button onClick={() => deleteQuestion(q.id)} className="shrink-0 font-medium text-carnation-600 hover:underline">Delete</button>
                </div>
              ))}
              {(detail.questions || []).length === 0 && <p className="p-4 text-sm text-espresso-400">No questions yet</p>}
            </div>

            <div className="space-y-2 rounded-xl bg-linen-50 p-4">
              <input
                placeholder="Question text"
                value={qForm.questionText}
                onChange={(e) => setQForm((f) => ({ ...f, questionText: e.target.value }))}
                className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
              {qForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={qForm.correctOptionIndex === i}
                    onChange={() => setQForm((f) => ({ ...f, correctOptionIndex: i }))}
                  />
                  <input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const options = [...qForm.options];
                      options[i] = e.target.value;
                      setQForm((f) => ({ ...f, options }));
                    }}
                    className="flex-1 rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <p className="text-xs text-espresso-400">Select the radio button next to the correct answer.</p>
              <button onClick={addQuestion} className="w-full rounded-xl bg-carissma-600 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
                + Add question
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
