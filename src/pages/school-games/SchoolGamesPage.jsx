import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { listResource, getResource } from '../../api/adminApi';

const PAGE_SIZE = 20;

// Read-only, super-admin-facing oversight of every game a school has
// created — schools manage their own games themselves (My Quizzes / My
// Games, only visible when logged in AS that school), this page is just
// so a super admin can see what's out there across every school without
// having to log into each one. Reuses the same /admin/game-sessions data
// the "Games history" page already lists (a school-hosted session is just
// a game_sessions row with school_id set) — just pre-filtered to the ones
// that have a school attached.
export default function SchoolGamesPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource('/admin/game-sessions', { page, pageSize: PAGE_SIZE, has_school: '1' });
      setRows(result.rows || []);
      setTotal(result.total ?? (result.rows ? result.rows.length : 0));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const view = async (row) => {
    setViewing(await getResource(`/admin/game-sessions/${row.id}`));
    setOpen(true);
  };

  return (
    <AdminLayout title={t('schoolGames.title')}>
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'title', label: t('gameSessions.game'), render: (r) => r.title || r.quiz_title || `#${r.id}` },
          { key: 'school_name', label: t('gameSessions.school'), render: (r) => r.school_name || '—' },
          { key: 'mode', label: 'Mode' },
          { key: 'status', label: t('common.status') },
          { key: 'participant_count', label: t('gameSessions.players') },
          { key: 'join_code', label: t('gameSessions.joinCode') },
          { key: 'created_at', label: t('gameSessions.created') },
        ]}
        onEdit={view}
      />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      {rows.length === 0 && !loading && (
        <p className="mt-4 text-center text-sm text-espresso-400">{t('schoolGames.noGamesYet')}</p>
      )}

      <Modal open={open} title={viewing ? viewing.title || viewing.quiz_title || `#${viewing.id}` : ''} onClose={() => setOpen(false)}>
        {viewing && (
          <div className="space-y-3 text-sm">
            <p><span className="font-medium text-espresso-700">{t('gameSessions.school')}:</span> {viewing.school_name || '—'}</p>
            <p><span className="font-medium text-espresso-700">{t('common.status')}:</span> {viewing.status}</p>
            <p><span className="font-medium text-espresso-700">{t('gameSessions.joinCode')}:</span> {viewing.join_code}</p>
            {viewing.board?.length > 0 && (
              <p>
                <span className="font-medium text-espresso-700">Games on the board:</span>{' '}
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
    </AdminLayout>
  );
}
