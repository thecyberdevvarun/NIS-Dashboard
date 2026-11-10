import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  KeyRound,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  X,
} from "lucide-react";
import { logout } from "../features/authSlice";
import { ADMIN_PAGES, PAGES, roleLabel } from "./navConfig";
import ChangePasswordModal from "./ChangePasswordModal";

const COLLAPSE_KEY = "nis_sidebar_collapsed";

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={({ isActive }) =>
        `flex items-center gap-3 border-l-4 py-2.5 text-sm transition-colors ${collapsed ? "justify-center px-0" : "px-5"} ${isActive ? "border-signal bg-ink-800 font-medium text-white" : "border-transparent text-white/70 hover:bg-ink-800 hover:text-white"}`
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function Sidebar({ collapsed, onToggle, onNavigate, mobile }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [pwOpen, setPwOpen] = useState(false);
  const allowed = new Set(user.pages);
  const items = PAGES.filter((p) => allowed.has(p.key));
  const adminItems = ADMIN_PAGES.filter((p) => allowed.has(p.key));
  const signOut = () => {
    dispatch(logout());
    navigate("/login");
  };
  const ToggleIcon = mobile ? X : collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <nav
      className="flex h-full flex-col bg-ink-900 text-white"
      aria-label="Main menu"
    >
      <div
        className={`flex items-center border-b border-ink-700 py-4 ${collapsed ? "flex-col gap-3 px-0" : "justify-between px-5"}`}
      >
        <div className="flex items-center gap-3">
          <Shield className="shrink-0 text-signal" size={collapsed ? 24 : 26} />
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-semibold">Neha Industrial</p>
              <p className="text-xs text-white/60">Security Management</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="rounded p-1.5 text-white/70 hover:bg-ink-800 hover:text-white"
          aria-label={collapsed ? "Open menu" : "Close menu"}
          title={collapsed ? "Open menu" : "Close menu"}
        >
          <ToggleIcon size={18} />
        </button>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto py-3">
        {items.map((item) => (
          <li key={item.key}>
            <NavItem
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>

      {adminItems.length > 0 && (
        <div className="border-t border-ink-700 py-2">
          {!collapsed && (
            <p className="px-5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Administration
            </p>
          )}
          <ul className="space-y-0.5">
            {adminItems.map((item) => (
              <li key={item.key}>
                <NavItem
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`border-t border-ink-700 ${collapsed ? "flex flex-col items-center gap-3 py-3" : "p-4"}`}
      >
        {collapsed ? (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-signal text-sm font-semibold text-ink-950"
            title={`${user.name} (${roleLabel(user.role)})`}
          >
            {user.name?.[0]?.toUpperCase()}
          </div>
        ) : (
          <>
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="mb-3 text-xs text-white/60">{roleLabel(user.role)}</p>
          </>
        )}
        <div
          className={
            collapsed ? "flex flex-col items-center gap-3" : "space-y-6"
          }
        >
          <button
            onClick={() => setPwOpen(true)}
            title="Change password"
            aria-label="Change password"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <KeyRound size={16} /> {!collapsed && "Change password"}
          </button>
          <button
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <LogOut size={16} /> {!collapsed && "Sign out"}
          </button>
        </div>
      </div>
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </nav>
  );
}

export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
  );
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setDrawer(false);
  }, [location.pathname]);
  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      return !c;
    });

  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={`hidden shrink-0 transition-[width] duration-200 lg:block ${collapsed ? "w-[68px]" : "w-60"}`}
      >
        <div
          className={`fixed inset-y-0 transition-[width] duration-200 ${collapsed ? "w-[68px]" : "w-60"}`}
        >
          <Sidebar collapsed={collapsed} onToggle={toggle} />
        </div>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/60"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64">
            <Sidebar
              collapsed={false}
              mobile
              onToggle={() => setDrawer(false)}
              onNavigate={() => setDrawer(false)}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setDrawer(true)} aria-label="Open menu">
            <Menu />
          </button>
          <span className="font-semibold">Neha Industrial Security</span>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
