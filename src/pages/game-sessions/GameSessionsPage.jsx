import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { listResource, getResource, createResource } from '../../api/adminApi';

const MODES = [
  { value: 'solo', label: 'Solo' },
  { value: 'team', label: 'Team' },
  { value: 'random', label: 'Random match' },
];

const EMPTY_CREATE_FORM = { title: '', mode: 'solo', schoolId: '', quizIds: [], maxPlayers: '' };

export default function GameSessionsPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);

  // "Create Game" flow — the school/education "specialize categories, get a
  // join code" step. Same game_sessions row the website Play flow uses.
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [quizzes, setQuizzes] = useState([]);
  const [schools, setSchools] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [created, setCreated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource('/admin/game-sessions');
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const view = async (row) => {
    setViewing(await getResource(`/admin/game-sessions/${row.id}`));
    setOpen(true);
  };

  const openCreate = async () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError('');
    setCreated(null);
    setCreateOpen(true);
    const [quizResult, schoolResult] = await Promise.all([
      listResource('/admin/quizzes', { pageSize: 100 }),
      listResource('/admin/schools', { pageSize: 100 }),
    ]);
    setQuizzes(quizResult.rows || []);
    setSchools(schoolResult.rows || []);
  };

  const toggleQuiz = (id) => {
    setCreateForm((f) => ({
      ...f,
      quizIds: f.quizIds.includes(id) ? f.quizIds.filter((x) => x !== id) : [...f.quizIds, id],
    }));
  };

  const submitCreate = async () => {
    if (!createForm.quizIds.length) {
      setCreateError('Pick at least one category to specialize this game.');
      return;
    }
    setCreateError('');
    setCreating(true);
    try {
      const session = await createResource('/admin/game-sessions', {
        mode: createForm.mode,
        quizIds: createForm.quizIds,
        title: createForm.title || undefined,
        schoolId: createForm.schoolId || undefined,
        maxPlayers: createForm.maxPlayers ? Number(createForm.maxPlayers) : undefined,
      });
      setCreated(session);
      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Could not create the game');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout title={t('gameSessions.title')}>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={openCreate}
          className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700"
        >
          Create Game
        </button>
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'title', label: t('gameSessions.game'), render: (r) => r.title || r.quiz_title || `#${r.id}` },
          { key: 'mode', label: t('gameSessions.mode') },
          { key: 'status', label: t('common.status') },
          { key: 'school_name', label: t('gameSessions.school'), render: (r) => r.school_name || '—' },
          { key: 'participant_count', label: t('gameSessions.players') },
          { key: 'join_code', label: t('gameSessions.joinCode') },
          { key: 'created_at', label: t('gameSessions.created') },
        ]}
        onEdit={view}
      />

      <Modal open={open} title={viewing ? viewing.title || viewing.quiz_title || `#${viewing.id}` : ''} onClose={() => setOpen(false)}>
        {viewing && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-espresso-700">{t('gameSessions.mode')}:</span> {viewing.mode} ·{' '}
              <span className="font-medium text-espresso-700">{t('common.status')}:</span> {viewing.status}
            </p>
            <p><span className="font-medium text-espresso-700">{t('gameSessions.joinCode')}:</span> {viewing.join_code}</p>
            {viewing.board?.length > 0 && (
              <p>
                <span className="font-medium text-espresso-700">Categories:</span>{' '}
                {viewing.board.map((b) => b.title_en).join(', ')}
              </p>
            )}
            <div className="rounded-xl border border-linen-200">
              <table className="w-full text-start text-sm">
                <thead className="bg-linen-50 text-espresso-600">
                  <tr>
                    <th className="px-3 py-2">{t('gameSessions.player')}</th>
                    <th className="px-3 py-2">{t('gameSessions.team')}</th>
                    <th className="px-3 py-2">{t('gameSessions.score')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewing.participants || []).map((p) => (
                    <tr key={p.id} className="border-t border-linen-100">
                      <td className="px-3 py-2">{p.full_name || p.guest_name || t('gameSessions.guest')}</td>
                      <td className="px-3 py-2">{p.team_name || '—'}</td>
                      <td className="px-3 py-2">{p.score}</td>
                    </tr>
                  ))}
                  {(viewing.participants || []).length === 0 && (
                    <tr><td colSpan={3} className="px-3 py-4 text-center text-espresso-400">No one has joined yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={createOpen} title="Create Game" onClose={() => setCreateOpen(false)}>
        {created ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-espresso-600">Game created. Share this code (or QR) with players — they join it from the website's Play page.</p>
            <p className="text-3xl font-extrabold tracking-[0.3em] text-carissma-600">{created.join_code}</p>
            {created.qr_code_url && (
              <img src={created.qr_code_url} alt="Join QR code" className="mx-auto h-48 w-48 rounded-xl border border-linen-200" />
            )}
            <button
              onClick={() => setCreateOpen(false)}
              className="w-full rounded-xl bg-carissma-600 py-2.5 text-sm font-semibold text-white hover:bg-carissma-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {createError && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{createError}</p>}

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">Game name (optional)</span>
              <input
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Grade 6 Science Quiz"
                className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">Type</span>
              <div className="flex gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setCreateForm((f) => ({ ...f, mode: m.value }))}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      createForm.mode === m.value
                        ? 'border-carissma-500 bg-carissma-600 text-white'
                        : 'border-linen-300 text-espresso-600 hover:border-carissma-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">School (optional)</span>
              <select
                value={createForm.schoolId}
                onChange={(e) => setCreateForm((f) => ({ ...f, schoolId: e.target.value }))}
                className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
              >
                <option value="">— None —</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name_en}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">Max players (optional)</span>
              <input
                type="number"
                min={1}
                value={createForm.maxPlayers}
                onChange={(e) => setCreateForm((f) => ({ ...f, maxPlayers: e.target.value }))}
                className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">Specialize — pick categories for the board</span>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-linen-200 p-2">
                {quizzes.map((q) => (
                  <label key={q.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-linen-50">
                    <input type="checkbox" checked={createForm.quizIds.includes(q.id)} onChange={() => toggleQuiz(q.id)} />
                    {q.title_en}
                  </label>
                ))}
                {quizzes.length === 0 && <p className="p-2 text-sm text-espresso-400">No games/quizzes yet — add one first.</p>}
              </div>
            </div>

            <button
              onClick={submitCreate}
              disabled={creating}
              className="w-full rounded-xl bg-carissma-600 py-2.5 text-sm font-semibold text-white hover:bg-carissma-700 disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create Game'}
            </button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
