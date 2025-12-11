import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBadge } from "@/components/NotificationBadge";
import {
  BarChart3,
  ClipboardList,
  DollarSign,
  LogOut,
  Settings,
  UserCircle,
  Users,
  FileText,
  QrCode,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isAdmin = user?.role === "admin";

  const menuItems = [
    {
      path: "/admin",
      label: "Indicações",
      icon: ClipboardList,
      adminOnly: false,
    },
    {
      path: "/admin/usuarios",
      label: "Usuários",
      icon: Users,
      adminOnly: true,
    },
    {
      path: "/admin/configuracoes",
      label: "Configurações",
      icon: Settings,
      adminOnly: true,
    },
    {
      path: "/estatisticas",
      label: "Estatísticas",
      icon: BarChart3,
      adminOnly: false,
    },
    {
      path: "/comissoes",
      label: "Comissões",
      icon: DollarSign,
      adminOnly: false,
    },
    {
      path: "/materiais-divulgacao",
      label: "Materiais",
      icon: FileText,
      adminOnly: false,
    },
    {
      path: "/admin/materiais-apoio",
      label: "Materiais de Apoio",
      icon: FileText,
      adminOnly: true,
    },
    {
      path: "/qr-codes",
      label: "QR Codes",
      icon: QrCode,
      adminOnly: false,
    },
  ].filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/">
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-16 w-auto cursor-pointer" />
          </Link>
          <h2 className="mt-3 text-lg font-bold text-foreground">{isAdmin ? "Painel Admin" : "Painel do Vendedor"}</h2>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <UserCircle className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
              <Badge variant="outline" className="mt-1">Admin</Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sua Saúde Vital</h1>
              <p className="text-sm text-muted-foreground">Plataforma de Comissionamento</p>
            </div>
            <NotificationBadge />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
