import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BoasVindasIndicadores from "./pages/BoasVindasIndicadores";
import MinhasIndicacoes from "./pages/MinhasIndicacoes";
import Admin from "./pages/Admin";
import Notificacoes from "./pages/Notificacoes";
import Vendedor from "./pages/Vendedor";
import Estatisticas from "./pages/Estatisticas";
import Perfil from "./pages/Perfil";
import Comissoes from "./pages/Comissoes";
import AdminConfiguracoes from "./pages/AdminConfiguracoes";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminMateriais from "./pages/AdminMateriais";
import MateriaisDivulgacao from "./pages/MateriaisDivulgacao";
import QRCodes from "./pages/QRCodes";
import CadastroIndicador from "./pages/CadastroIndicador";
import LoginIndicador from "./pages/LoginIndicador";
import EsqueciSenha from "./pages/EsqueciSenha";
import RecuperarSenha from "./pages/RecuperarSenha";
import TabelaComissoes from "./pages/TabelaComissoes";
import ClassificarLead from "./pages/ClassificarLead";
import DashboardPromotor from "./pages/DashboardPromotor";
import AdminMateriaisApoio from "./pages/AdminMateriaisApoio";
import MateriaisApoio from "./pages/MateriaisApoio";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={BoasVindasIndicadores} />
      <Route path={"/indicar"} component={Home} />
      <Route path={"/minhas-indicacoes"} component={MinhasIndicacoes} />
      <Route path={"/painel-promotor"} component={DashboardPromotor} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/usuarios"} component={AdminUsuarios} />
      <Route path={"/admin/configuracoes"} component={AdminConfiguracoes} />
      <Route path={"/admin/materiais"} component={AdminMateriais} />
      <Route path={"/admin/materiais-apoio"} component={AdminMateriaisApoio} />
      <Route path={"/notificacoes"} component={Notificacoes} />
      <Route path={"/vendedor"} component={Vendedor} />
      <Route path={"/estatisticas"} component={Estatisticas} />
      <Route path={"/perfil"} component={Perfil} />
      <Route path={"/comissoes"} component={Comissoes} />
      <Route path={"/materiais-divulgacao"} component={MateriaisDivulgacao} />
      <Route path={"/materiais-apoio"} component={MateriaisApoio} />
      <Route path={"/qr-codes"} component={QRCodes} />
      <Route path={"/boas-vindas-indicadores"} component={BoasVindasIndicadores} />
      <Route path={"/tabela-comissoes"} component={TabelaComissoes} />
      <Route path={"/classificar-lead/:id"} component={ClassificarLead} />
      <Route path={"/cadastro-indicador"} component={CadastroIndicador} />
      <Route path={"/login-indicador"} component={LoginIndicador} />
      <Route path={"/esqueci-senha"} component={EsqueciSenha} />
      <Route path={"/recuperar-senha"} component={RecuperarSenha} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
