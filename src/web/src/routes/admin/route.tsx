import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Inbox,
  Home,
  Layers,
  LogOut,
  Menu,
  Settings,
  Tags,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { getSessionFn, logoutFn, type SessionUser } from "@/server/auth";
import { useIsAdvanced } from "@/lib/useMode";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }): Promise<{ session: SessionUser | null }> => {
    if (location.pathname === "/admin/login") return { session: null };
    const session = await getSessionFn();
    if (!session) throw redirect({ to: "/admin/login" });
    return { session };
  },
  component: AdminLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  disabled?: boolean;
  adminOnly?: boolean;
  /** Visible seulement en mode « advanced » (calendrier / commandes / rapports). */
  advancedOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Tableau de bord", icon: Home, exact: true },
  { to: "/admin/equipements", label: "Équipements", icon: Layers },
  { to: "/admin/categories", label: "Catégories", icon: Tags },
  { to: "/admin/demandes", label: "Demandes", icon: Inbox, advancedOnly: true },
  { to: "/admin/commandes", label: "Commandes", icon: ClipboardList, advancedOnly: true },
  { to: "/admin/rapports", label: "Rapports", icon: BarChart3, advancedOnly: true },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings },
  { to: "/admin/employes", label: "Employés & rôles", icon: Users, adminOnly: true },
  { to: "/admin/mon-compte", label: "Mon compte", icon: UserCircle },
];

function AdminLayout() {
  const { session } = Route.useRouteContext();
  const pathname = useLocation({ select: (l) => l.pathname });
  const navigate = useNavigate();
  const advanced = useIsAdvanced();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return <Outlet />;
  if (!session) return null;

  async function logout() {
    await logoutFn();
    navigate({ to: "/admin/login" });
  }

  const links = NAV.filter(
    (n) => (!n.adminOnly || session?.role === "admin") && (!n.advancedOnly || advanced),
  );

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        if (n.disabled) {
          return (
            <span
              key={n.to}
              className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
              <span className="ml-auto text-[10px] uppercase">bientôt</span>
            </span>
          );
        }
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-secondary text-primary"
                : "text-foreground/80 hover:bg-secondary hover:text-primary"
            }`}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
      >
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Barre latérale (bureau) */}
      <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-card lg:block">
        <div className="border-b border-border/60 p-4">
          <p className="font-serif text-lg font-bold tracking-wide text-primary">PRESTIGE</p>
          <p className="text-xs text-muted-foreground">Administration</p>
        </div>
        {nav}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3">
          <button className="text-primary lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <p className="text-sm text-muted-foreground">
            Connecté : <span className="font-semibold text-foreground">{session.name}</span>{" "}
            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-primary">
              {session.role}
            </span>
          </p>
          <Link to="/fr" className="text-xs text-primary hover:underline">
            Voir le site →
          </Link>
        </header>
        {open && <div className="border-b border-border/60 bg-card lg:hidden">{nav}</div>}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
