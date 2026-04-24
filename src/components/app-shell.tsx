import Link from "next/link";
import { BarChart3, ClipboardList, Settings, Shield, TimerReset } from "lucide-react";
import type { Profile } from "@/lib/types";
import { LogoutButton } from "@/components/logout-button";
import { SessionGuard } from "@/components/session-guard";

type AppShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

const links = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/history", label: "Histori Nilai", icon: ClipboardList },
  { href: "/settings", label: "Password", icon: Settings },
];

export function AppShell({ profile, children }: AppShellProps) {
  const visibleLinks =
    profile.role === "superadmin" ? [...links, { href: "/admin", label: "Superadmin", icon: Shield }] : links;

  return (
    <div className="page">
      <SessionGuard />
      <div className="app-frame">
        <aside className="sidebar">
          <div>
            <p className="micro-label">WIRE PRACTICE</p>
            <h1 className="brand-small">Psikotes Kemenkeu</h1>
          </div>

          <nav aria-label="Navigasi utama">
            <ul className="nav-list">
              {visibleLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link className="nav-link" href={item.href}>
                      <span className="nav-mark" aria-hidden="true" />
                      <Icon aria-hidden="true" size={19} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="wire-panel-dashed panel-pad">
            <p className="micro-label">Login aktif</p>
            <strong>{profile.display_name}</strong>
            <p className="mono muted">{profile.phone}</p>
          </div>

          <div style={{ marginTop: "auto", display: "grid", gap: 14 }}>
            <Link className="rough-button blue" href="/dashboard">
              <TimerReset aria-hidden="true" size={18} /> Latihan
            </Link>
            <LogoutButton />
          </div>
        </aside>

        <main className="main-pane">{children}</main>
      </div>
      <p className="footer-note">
        Platform belajar independen, bukan situs resmi Kementerian Keuangan.
      </p>
    </div>
  );
}

