import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from './navConfig';

function SectionLink({ item }) {
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
      {item.label}
    </NavLink>
  );
}

function SectionGroup({ section }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-espresso-800 hover:bg-carissma-50"
      >
        {section.label}
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
      </button>
      {open && (
        <div className="ml-2 mt-1 space-y-1 border-l border-linen-200 pl-3">
          {section.children.map((child) => (
            <SectionLink key={child.to} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-linen-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-carissma-600 font-bold text-white">MD</div>
        <div>
          <p className="text-sm font-semibold text-espresso-900">Make Down</p>
          <p className="text-xs text-espresso-500">Admin panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {NAV_SECTIONS.map((section) =>
          section.children ? <SectionGroup key={section.label} section={section} /> : <SectionLink key={section.to} item={section} />
        )}
      </nav>
    </aside>
  );
}
