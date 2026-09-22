import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { listResource, getResource, createResource, updateResource } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const PAGE_SIZE = 20;

const AUDIENCES = [
  { value: 'girls', label: 'Only Girl' },
  { value: 'boys', label: 'Only Boy' },
  { value: 'mixed', label: 'Boy & Girl' },
];

// A regular admin-created session has no solo/team/random choice any more —
// it's always 'solo' behind the scenes (no team grouping; any number of
// players can still join and play individually with the join code/QR).
// A SCHOOL creating its own game is always 'team' mode (Team1 vs Team2, per
// the School Games design) — there's no solo option for a school game, so
// there's no mode picker in the UI at all; see isTeamGame below.
const SESSION_MODE = 'solo';

const EMPTY_FORM = {
  title: '',
  titleAr: '',
  schoolId: '',
  quizIds: [],
  maxPlayers: '',
  audience: '',
  scheduledDate: '',
  scheduledTime: '',
  team1Name: '',
  team1Capacity: '',
  team2Name: '',
  team2Capacity: '',
};

export default function GameSessionsPage() {
  const { t } = useTranslation();
  const { role } = useAdminAuth();
  const isSchool = role === 'school';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // "Create/Edit Game" flow — the school/education "specialize categories,
  // get a join code" step, plus editing the same fields afterwards. Same
  // game_sessions row the website Play flow uses. editingId is null while
  // creating, and the session id while editing an existing one.
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [schools, setSchools] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [created, setCreated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource('/admin/game-sessions', { page, pageSize: PAGE_SIZE });
      setRows(result.rows || []);
      setTotal(result.total ?? (result.rows ? result.rows.length : 0));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  // Eye icon — read-only: status, join code, board categories, participants.
  const view = async (row) => {
    setViewing(await getResource(`/admin/game-sessions/${row.id}`));
    setOpen(true);
  };

  const openCreate = async () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setCreated(null);
    setEditingId(null);
    setFormOpen(true);
    const [quizResult, schoolResult] = await Promise.all([
      listResource('/admin/quizzes', { pageSize: 100 }),
      isSchool ? Promise.resolve({ rows: [] }) : listResource('/admin/schools', { pageSize: 100 }),
    ]);
    setQuizzes(quizResult.rows || []);
    setSchools(schoolResult.rows || []);
  };

  // Pencil icon — pre-fills the same form the create flow uses from the
  // session's current title/schedule/audience/teams/board.
  const openEdit = async (row) => {
    setFormError('');
    setCreated(null);
    setEditingId(row.id);
    setFormOpen(true);
    const [detail, quizResult, schoolResult] = await Promise.all([
      getResource(`/admin/game-sessions/${row.id}`),
      listResource('/admin/quizzes', { pageSize: 100 }),
      isSchool ? Promise.resolve({ rows: [] }) : listResource('/admin/schools', { pageSize: 100 }),
    ]);
    setQuizzes(quizResult.rows || []);
    setSchools(schoolResult.rows || []);
    setForm({
      title: detail.title || '',
      titleAr: detail.title_ar || '',
      schoolId: detail.school_id || '',
      quizIds: detail.quizIds || [],
      maxPlayers: detail.max_players || '',
      audience: detail.audience || '',
      scheduledDate: String(detail.scheduled_date || '').slice(0, 10),
      scheduledTime: String(detail.scheduled_time || '').slice(0, 5),
      team1Name: detail.teams?.[0]?.name || '',
      team1Capacity: detail.teams?.[0]?.capacity || '',
      team2Name: detail.teams?.[1]?.name || '',
      team2Capacity: detail.teams?.[1]?.capacity || '',
    });
  };

  const toggleQuiz = (id) => {
    setForm((f) => ({
      ...f,
      quizIds: f.quizIds.includes(id) ? f.quizIds.filter((x) => x !== id) : [...f.quizIds, id],
    }));
  };

  // Schools only ever create team games now — no solo option.
  const isTeamGame = isSchool;

  const submitForm = async () => {
    if (!form.quizIds.length) {
      setFormError('Pick at least one category to specialize this game.');
      return;
    }
    if (isSchool && (!form.title.trim() || !form.titleAr.trim())) {
      setFormError('Enter the game name in both English and Arabic.');
      return;
    }
    if (isTeamGame && (!form.team1Name.trim() || !form.team2Name.trim())) {
      setFormError('Name both teams.');
      return;
    }
    setFormError('');
    setSaving(true);
    const payload = {
      mode: isSchool ? 'team' : SESSION_MODE,
      quizIds: form.quizIds,
      title: form.title || undefined,
      titleAr: isSchool ? form.titleAr.trim() : undefined,
      schoolId: isSchool ? undefined : form.schoolId || undefined,
      maxPlayers: form.maxPlayers ? Number(form.maxPlayers) : undefined,
      audience: form.audience || undefined,
      scheduledDate: form.scheduledDate || undefined,
      scheduledTime: form.scheduledTime || undefined,
      team1Name: isTeamGame ? form.team1Name : undefined,
      team1Capacity: isTeamGame && form.team1Capacity ? Number(form.team1Capacity) : undefined,
      team2Name: isTeamGame ? form.team2Name : undefined,
      team2Capacity: isTeamGame && form.team2Capacity ? Number(form.team2Capacity) : undefined,
    };
    try {
      if (editingId) {
        await updateResource(`/admin/game-sessions/${editingId}`, payload);
        setFormOpen(false);
        load();
      } else {
        const session = await createResource('/admin/game-sessions', payload);
        setCreated(session);
        load();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || `Could not ${editingId ? 'update' : 'create'} the game`);
    } finally {
      setSaving(false);
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
          { key: 'status', label: t('common.status') },
          { key: 'school_name', label: t('gameSessions.school'), render: (r) => r.school_name || '—' },
          { key: 'participant_count', label: t('gameSessions.players') },
          { key: 'join_code', label: t('gameSessions.joinCode') },
          { key: 'created_at', label: t('gameSessions.created') },
        ]}
        onView={view}
        onEdit={openEdit}
      />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <Modal open={open} title={viewing ? viewing.title || viewing.quiz_title || `#${viewing.id}` : ''} onClose={() => setOpen(false)}>
        {viewing && (
          <div className="space-y-3 text-sm">
            <p>
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
                    <th className="px-3 py-2">{t('gameSessions.score')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewing.participants || []).map((p) => (
                    <tr key={p.id} className="border-t border-linen-100">
                      <td className="px-3 py-2">{p.full_name || p.guest_name || t('gameSessions.guest')}</td>
                      <td className="px-3 py-2">{p.score}</td>
                    </tr>
                  ))}
                  {(viewing.participants || []).length === 0 && (
                    <tr><td colSpan={2} className="px-3 py-4 text-center text-espresso-400">No one has joined yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={formOpen} title={editingId ? 'Edit Game' : 'Create Game'} onClose={() => setFormOpen(false)}>
        {created ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-espresso-600">Game created. Share this code (or QR) with players — they join it from the website's Play page.</p>
            <p className="text-3xl font-extrabold tracking-[0.3em] text-carissma-600">{created.join_code}</p>
            {created.qr_code_url && (
              <img src={created.qr_code_url} alt="Join QR code" className="mx-auto h-48 w-48 rounded-xl border border-linen-200" />
            )}
            <button
              onClick={() => setFormOpen(false)}
              className="w-full rounded-xl bg-carissma-600 py-2.5 text-sm font-semibold text-white hover:bg-carissma-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {formError && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{formError}</p>}

            {isSchool ? (
              <div className="flex gap-3">
                <div className="flex-1">
                  <span className="mb-1.5 block text-sm font-medium text-espresso-800">Game name — English</span>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Grade 6 Science Quiz"
                    dir="ltr"
                    className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <span className="mb-1.5 block text-sm font-medium text-espresso-800">Game name — Arabic</span>
                  <input
                    value={form.titleAr}
                    onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                    placeholder="مثال: اختبار العلوم للصف السادس"
                    dir="rtl"
                    className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <span className="mb-1.5 block text-sm font-medium text-espresso-800">Game name (optional)</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Grade 6 Science Quiz"
                  className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            {isTeamGame && (
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <input
                    value={form.team1Name}
                    onChange={(e) => setForm((f) => ({ ...f, team1Name: e.target.value }))}
                    placeholder="Team 1 name"
                    className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    value={form.team1Capacity}
                    onChange={(e) => setForm((f) => ({ ...f, team1Capacity: e.target.value }))}
                    placeholder="Team 1 players"
                    className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    value={form.team2Name}
                    onChange={(e) => setForm((f) => ({ ...f, team2Name: e.target.value }))}
                    placeholder="Team 2 name"
                    className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    value={form.team2Capacity}
                    onChange={(e) => setForm((f) => ({ ...f, team2Capacity: e.target.value }))}
                    placeholder="Team 2 players"
                    className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {!isSchool && (
              <div>
                <span className="mb-1.5 block text-sm font-medium text-espresso-800">School (optional)</span>
                <select
                  value={form.schoolId}
                  onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
                  className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>{s.name_en}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">Audience (optional)</span>
              <div className="flex gap-2">
                {AUDIENCES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, audience: f.audience === a.value ? '' : a.value }))}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      form.audience === a.value
                        ? 'border-carissma-500 bg-carissma-600 text-white'
                        : 'border-linen-300 text-espresso-600 hover:border-carissma-300'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <span className="mb-1.5 block text-sm font-medium text-espresso-800">Game date (optional)</span>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <span className="mb-1.5 block text-sm font-medium text-espresso-800">Game time (optional)</span>
                <input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                  className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            {form.scheduledDate && form.scheduledTime && (
              <p className="-mt-2 text-xs font-medium text-espresso-500">Players can join starting 10 minutes before this time.</p>
            )}

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">Max players (optional)</span>
              <input
                type="number"
                min={1}
                value={form.maxPlayers}
                onChange={(e) => setForm((f) => ({ ...f, maxPlayers: e.target.value }))}
                className="w-full rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">Specialize — pick categories for the board</span>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-linen-200 p-2">
                {quizzes.map((q) => (
                  <label key={q.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-linen-50">
                    <input type="checkbox" checked={form.quizIds.includes(q.id)} onChange={() => toggleQuiz(q.id)} />
                    {q.title_en}
                  </label>
                ))}
                {quizzes.length === 0 && <p className="p-2 text-sm text-espresso-400">No games/quizzes yet — add one first.</p>}
              </div>
            </div>

            <button
              onClick={submitForm}
              disabled={saving}
              className="w-full rounded-xl bg-carissma-600 py-2.5 text-sm font-semibold text-white hover:bg-carissma-700 disabled:opacity-60"
            >
              {saving ? (editingId ? 'Saving…' : 'Creating…') : editingId ? 'Save Changes' : 'Create Game'}
            </button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
