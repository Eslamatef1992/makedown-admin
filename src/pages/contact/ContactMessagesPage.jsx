import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { listResource, updateResource } from '../../api/adminApi';

const STATUS_COLORS = { new: 'text-carissma-600', read: 'text-saffron-700', replied: 'text-espresso-500' };

export default function ContactMessagesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource('/admin/contact-messages');
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const view = async (row) => {
    setViewing(row);
    setOpen(true);
    if (row.status === 'new') {
      await updateResource(`/admin/contact-messages/${row.id}`, { status: 'read' });
      load();
    }
  };

  const markReplied = async () => {
    await updateResource(`/admin/contact-messages/${viewing.id}`, { status: 'replied' });
    setOpen(false);
    load();
  };

  return (
    <AdminLayout title="Get in touch">
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'subject', label: 'Subject', render: (r) => r.subject || '—' },
          { key: 'status', label: 'Status', render: (r) => <span className={STATUS_COLORS[r.status]}>{r.status}</span> },
          { key: 'created_at', label: 'Received' },
        ]}
        onEdit={view}
      />

      <Modal open={open} title={viewing?.subject || 'Message'} onClose={() => setOpen(false)}>
        {viewing && (
          <div className="space-y-3 text-sm">
            <p><span className="font-medium text-espresso-700">From:</span> {viewing.name} ({viewing.email})</p>
            {viewing.phone && <p><span className="font-medium text-espresso-700">Phone:</span> {viewing.phone}</p>}
            <p className="whitespace-pre-wrap rounded-xl bg-linen-50 p-4 text-espresso-800">{viewing.message}</p>
            {viewing.status !== 'replied' && (
              <button onClick={markReplied} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
                Mark as replied
              </button>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
