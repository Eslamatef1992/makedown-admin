import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { listResource, getResource } from '../../api/adminApi';

export default function GameSessionsPage() {
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
    <AdminLayout title="Games history">
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'quiz_title', label: 'Game' },
          { key: 'mode', label: 'Mode' },
          { key: 'status', label: 'Status' },
          { key: 'school_name', label: 'School', render: (r) => r.school_name || '—' },
          { key: 'participant_count', label: 'Players' },
          { key: 'created_at', label: 'Created' },
        ]}
        onEdit={view}
      />

      <Modal open={open} title={viewing ? viewing.quiz_title : ''} onClose={() => setOpen(false)}>
        {viewing && (
          <div className="space-y-3 text-sm">
            <p><span className="font-medium text-espresso-700">Mode:</span> {viewing.mode} · <span className="font-medium text-espresso-700">Status:</span> {viewing.status}</p>
            <p><span className="font-medium text-espresso-700">Join code:</span> {viewing.join_code}</p>
            <div className="rounded-xl border border-linen-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-linen-50 text-espresso-600">
                  <tr>
                    <th className="px-3 py-2">Player</th>
                    <th className="px-3 py-2">Team</th>
                    <th className="px-3 py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewing.participants || []).map((p) => (
                    <tr key={p.id} className="border-t border-linen-100">
                      <td className="px-3 py-2">{p.full_name || p.guest_name || 'Guest'}</td>
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
