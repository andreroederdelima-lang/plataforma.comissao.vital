import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, DollarSign, LogOut, User, Image, Plus, Bell, LayoutDashboard, Menu, X, QrCode, Settings } from "lucide-react";
import { toast } from "sonner";

interface PainelVendedorLayoutProps {
  children: ReactNode;
}

/**
 * Layout com sidebar responsivo para o painel do vendedor/promotor
 * Mobile: Menu hambúrguer
 * Desktop: Sidebar fixa
 */
export default function PainelVendedorLayout({ children }: PainelVendedorLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout realizado com sucesso!");
      setLocation("/login-indicador");
    },
  });

  const { data: meuIndicador } = trpc.indicacoes.meuIndicador.useQuery();

  // Buscar indicações com mudança de status recente (últimas 24h)
  const { data: minhasIndicacoes = [] } = trpc.indicacoes.listarIndicacoes.useQuery(
    undefined,
    { enabled: !!meuIndicador, refetchInterval: 30000 } // Atualiza a cada 30s
  );

  // Contar indicações com status atualizado nas últimas 24h
  const notificacoesCount = minhasIndicacoes.filter((ind: any) => {
    if (!ind.dataAtualizacao) return false;
    const dataAtualizacao = new Date(ind.dataAtualizacao);
    const umDiaAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return dataAtualizacao > umDiaAtras && ind.status !== "pendente";
  }).length;

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/painel-promotor",
    },
    {
      icon: FileText,
      label: "Vendas e Indicações",
      path: "/minhas-indicacoes",
    },
    {
      icon: BarChart3,
      label: "Estatísticas",
      path: "/estatisticas",
    },
    {
      icon: DollarSign,
      label: "Comissões",
      path: "/comissoes",
    },
    {
      icon: QrCode,
      label: "QR Codes",
      path: "/qr-codes",
    },
    {
      icon: Image,
      label: "Biblioteca de Recursos",
      path: "/materiais-divulgacao",
    },
    {
      icon: Image,
      label: "Materiais de Apoio",
      path: "/materiais-apoio",
    },
    {
      icon: Settings,
      label: "Meu Cadastro",
      path: "/meu-perfil",
    },
  ];

  const actionButtons = [
    {
      icon: Plus,
      label: "🎯 Cadastrar VENDA",
      path: "/indicar?tipo=venda",
      action: "create",
      variant: "primary" as const,
    },
    {
      icon: Plus,
      label: "📝 Cadastrar Indicação",
      path: "/indicar?tipo=indicacao",
      action: "create",
      variant: "secondary" as const,
    },
  ];

  const isActive = (path: string) => location === path;

  const handleNavigate = (path: string) => {
    setLocation(path);
    setSidebarOpen(false); // Fechar sidebar no mobile após navegação
  };

  // Componente Sidebar (reutilizado para mobile e desktop)
  const SidebarContent = () => (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Painel do {meuIndicador?.tipo === "promotor" ? "Promotor" : "Vendedor"}
        </h2>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-[#1e9d9f] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Botões de Ação Rápida */}
      <div className="mt-6 pt-6 border-t space-y-3">
        {actionButtons.map((btn) => {
          const Icon = btn.icon;
          const isPrimary = btn.variant === "primary";
          return (
            <Button
              key={btn.label}
              onClick={() => handleNavigate(btn.path)}
              className={`w-full ${
                isPrimary
                  ? "bg-green-600 hover:bg-green-700 text-white text-base py-6"
                  : "bg-gray-400 hover:bg-gray-500 text-white text-sm py-4"
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {btn.label}
            </Button>
          );
        })}
      </div>

      {/* User Info & Logout */}
      <div className="mt-auto pt-6 border-t">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <User className="h-5 w-5 text-gray-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {meuIndicador?.nome || "Admin"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role === "admin" ? "Admin" : meuIndicador?.tipo || "Vendedor"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)]">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e9d9f] shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Menu Hambúrguer (Mobile) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Vital" className="h-12 lg:h-16" />
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-bold text-[#1e9d9f]">Sua Saúde Vital</h1>
                <p className="text-xs lg:text-sm text-gray-600">Plataforma de Comissionamento</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Badge de Notificações */}
              <button
                onClick={() => handleNavigate("/minhas-indicacoes")}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Notificações de indicações"
              >
                <Bell className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
                {notificacoesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificacoesCount > 9 ? "9+" : notificacoesCount}
                  </span>
                )}
              </button>

              {/* Avatar */}
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#1e9d9f] rounded-full flex items-center justify-center">
                <span className="text-white text-xs lg:text-sm font-bold">
                  {meuIndicador?.nome?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Overlay (Mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r min-h-[calc(100vh-88px)] p-4 sticky top-[88px] self-start">
          <SidebarContent />
        </aside>

        {/* Sidebar Mobile (Drawer) */}
        <aside
          className={`fixed top-[88px] left-0 bottom-0 w-72 bg-white border-r z-50 p-4 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
