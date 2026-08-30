import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { listResource, createResource, updateResource, deleteResource, getResource, putResource } from '../../api/adminApi';

export default function RolesPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permRole, setPermRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [checkedIds, setCheckedIds] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource('/admin/roles');
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, description: row.description || '' });
    setModalOpen(true);
  };
  const onSave = async () => {
    if (editing) await updateResource(`/admin/roles/${editing.id}`, form);
    else await createResource('/admin/roles', form);
    setModalOpen(false);
    load();
  };
  const onDelete = async (row) => {
    if (!confirm(t('roles.confirmDelete'))) return;
    await deleteResource(`/admin/roles/${row.id}`);
    load();
  };

  const openPermissions = async (row) => {
    setPermRole(row);
    const [perms, roleIds] = await Promise.all([
      allPermissions.length ? Promise.resolve(allPermissions) : listResource('/admin/roles/permissions'),
      getResource(`/admin/roles/${row.id}/permissions`),
    ]);
    setAllPermissions(Array.isArray(perms) ? perms : perms.rows || perms);
    setCheckedIds(new Set(roleIds));
    setPermModalOpen(true);
  };

  const togglePerm = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const savePermissions = async () => {
    await putResource(`/admin/roles/${permRole.id}/permissions`, { permissionIds: Array.from(checkedIds) });
    setPermModalOpen(false);
  };

  const grouped = allPermissions.reduce((acc, p) => {
    (acc[p.module] = acc[p.module] || []).push(p);
    return acc;
  }, {});

  return (
    <AdminLayout title={t('roles.title')}>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
          {t('common.addNew')}
        </button>
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name', label: t('common.name') },
          { key: 'description', label: t('common.description') },
          {
            key: 'permissions',
            label: t('roles.permissions'),
            render: (r) => (
              <button onClick={() => openPermissions(r)} className="font-medium text-carissma-600 hover:underline">
                {t('common.manage')}
              </button>
            ),
          },
        ]}
        onEdit={openEdit}
        onDelete={onDelete}
      />

      <Modal
        open={modalOpen}
        title={editing ? t('roles.editRole') : t('roles.addRole')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-linen-100">
              {t('common.cancel')}
            </button>
            <button onClick={onSave} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
              {t('common.save')}
            </button>
          </>
        }
      >
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('common.name')}</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('common.description')}</span>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
          />
        </label>
      </Modal>

      <Modal
        open={permModalOpen}
        title={t('roles.permissionsFor', { name: permRole?.name || '' })}
        onClose={() => setPermModalOpen(false)}
        footer={
          <>
            <button onClick={() => setPermModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-linen-100">
              {t('common.cancel')}
            </button>
            <button onClick={savePermissions} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
              {t('common.save')}
            </button>
          </>
        }
      >
        {Object.entries(grouped).map(([module, perms]) => (
          <div key={module} className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-espresso-500">{module}</p>
            <div className="space-y-1.5">
              {perms.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm text-espresso-800">
                  <input type="checkbox" checked={checkedIds.has(p.id)} onChange={() => togglePerm(p.id)} className="rounded" />
                  {p.description || p.key_name}
                </label>
              ))}
            </div>
          </div>
        ))}
      </Modal>
    </AdminLayout>
  );
}
