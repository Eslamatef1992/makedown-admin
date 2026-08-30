import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { listResource, getResource } from '../../api/adminApi';

export default function GameSessionsPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);

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

  return (
    <AdminLayout title={t('gameSessions.title')}>
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'quiz_title', label: t('gameSessions.game') },
          { key: 'mode', label: t('gameSessions.mode') },
          { key: 'status', label: t('common.status') },
          { key: 'school_name', label: t('gameSessions.school'), render: (r) => r.school_name || '—' },
          { key: 'participant_count', label: t('gameSessions.players') },
          { key: 'created_at', label: t('gameSessions.created') },
        ]}
        onEdit={view}
      />

      <Modal open={open} title={viewing ? viewing.quiz_title : ''} onClose={() => setOpen(false)}>
        {viewing && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-espresso-700">{t('gameSessions.mode')}:</span> {viewing.mode} ·{' '}
              <span className="font-medium text-espresso-700">{t('common.status')}:</span> {viewing.status}
            </p>
            <p><span className="font-medium text-espresso-700">{t('gameSessions.joinCode')}:</span> {viewing.join_code}</p>
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
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
