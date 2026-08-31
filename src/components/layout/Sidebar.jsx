import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NAV_SECTIONS } from './navConfig';
import { useAdminAuth } from '../../context/AdminAuthContext';

function SectionLink({ item, t }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2 text-sm font-medium transition ${
          isActive ? 'bg-carissma-600 text-white' : 'text-espresso-700 hover:bg-carissma-50'
        }`
      }
    >
      {t(item.labelKey)}
    </NavLink>
  );
}

function SectionGroup({ section, t }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-espresso-800 hover:bg-carissma-50"
      >
        {t(section.labelKey)}
        <span className={`transition-transform ${open ? 'rotate-90' : ''} rtl:-scale-x-100`}>›</span>
      </button>
      {open && (
        <div className="me-2 mt-1 space-y-1 border-s border-linen-200 ps-3">
          {section.children.map((child) => (
            <SectionLink key={child.to} item={child} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { role } = useAdminAuth();
  const isSchool = role === 'school';
  const sections = isSchool ? [{ to: '/game-sessions', labelKey: 'nav.myGames' }] : NAV_SECTIONS;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-e border-linen-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <img src="/logo-mark.png" alt="Make Down" className="h-10 w-10 object-contain" />
        <div>
          <p className="text-sm font-semibold text-espresso-900">Make Down</p>
          <p className="text-xs text-espresso-500">{t('nav.adminPanel')}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {sections.map((section) =>
          section.children ? (
            <SectionGroup key={section.labelKey} section={section} t={t} />
          ) : (
            <SectionLink key={section.to} item={section} t={t} />
          )
        )}
      </nav>
    </aside>
  );
}
