import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Topbar({ title }) {
  const { admin, logout } = useAdminAuth();
  return (
    <header className="flex items-center justify-between border-b border-linen-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-espresso-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-espresso-800">{admin?.name}</p>
          <p className="text-xs text-espresso-500">{admin?.email}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-full bg-carissma-100 px-4 py-2 text-sm font-medium text-carissma-700 hover:bg-carissma-200"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
