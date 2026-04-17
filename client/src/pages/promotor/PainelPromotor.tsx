import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Gift, Loader2, LogOut, Plus } from "lucide-react";
import { APP_LOGO } from "@/const";

const VITAL = { turquoise: "#2B9C9C" };

const STATUS_LABEL: Record<string, string> = {
  aguardando_contato: "Aguardando contato",
  em_negociacao: "Em negociação",
  venda_com_objecoes: "Em negociação (com objeções)",
  venda_fechada: "Fechada",
  nao_comprou: "Não fechou",
  cliente_sem_interesse: "Sem interesse",
};

const TIPO_BENEFICIO_LABEL: Record<string, string> = {
  mensalidade_gratis: "Mensalidade grátis",
  pix: "PIX",
};

const STATUS_BENEFICIO_VARIANT: Record<string, "default" | "outline" | "secondary"> = {
  pendente: "outline",
  pago: "default",
  cancelado: "secondary",
};

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("pt-BR");
}

function formatMoney(cents: number | null | undefined): string {
  if (cents == null) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export default function PainelPromotor() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const indicacoes = trpc.indicacoes.listMine.useQuery(undefined, {
    enabled: !!user,
  });
  const beneficios = trpc.beneficiosPromotor.meus.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation("/login");
    }
  }, [loading, user, setLocation]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: VITAL.turquoise }} />
      </div>
    );
  }

  const totalIndicacoes = indicacoes.data?.length ?? 0;
  const fechadas =
    indicacoes.data?.filter((i) => i.status === "venda_fechada").length ?? 0;
  const beneficiosPendentes =
    beneficios.data?.filter((b) => b.status === "pendente").length ?? 0;
  const beneficiosPagos =
    beneficios.data?.filter((b) => b.status === "pago").length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)]">
      <header className="bg-white border-b-4 shadow-sm" style={{ borderColor: VITAL.turquoise }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Vital" className="h-12" />
            <div>
              <h1 className="text-lg font-bold" style={{ color: VITAL.turquoise }}>
                Olá, {user.name?.split(" ")[0] || "Promotor"}
              </h1>
              <p className="text-xs text-gray-600">Painel do Promotor Vital</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Indicações feitas" value={totalIndicacoes} />
          <Stat label="Já fecharam" value={fechadas} highlight />
          <Stat label="Benefícios pendentes" value={beneficiosPendentes} />
          <Stat label="Benefícios pagos" value={beneficiosPagos} highlight />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Minhas indicações</CardTitle>
              <CardDescription>
                Quem você indicou e em que etapa cada um está.
              </CardDescription>
            </div>
            <Button
              onClick={() => setLocation("/indicar?tipo=indicacao")}
              className="text-white"
              style={{ backgroundColor: VITAL.turquoise }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova indicação
            </Button>
          </CardHeader>
          <CardContent>
            {indicacoes.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" />
            ) : totalIndicacoes === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma indicação ainda. Comece agora no botão acima.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicado</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicacoes.data!.map((ind) => (
                      <TableRow key={ind.id}>
                        <TableCell className="font-medium">
                          {ind.nomeIndicado}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ind.nomePlano} {ind.tipoPlano}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ind.status === "venda_fechada" ? "default" : "outline"
                            }
                          >
                            {STATUS_LABEL[ind.status] ?? ind.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(ind.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" style={{ color: VITAL.turquoise }} />
              Meus benefícios
            </CardTitle>
            <CardDescription>
              Um benefício é registrado por um vendedor Vital após a conversa com
              você. Você escolhe entre mensalidade grátis ou PIX.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {beneficios.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" />
            ) : (beneficios.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Você ainda não tem benefícios. Eles aparecem aqui quando uma
                indicação sua fecha e o vendedor registra.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registrado em</TableHead>
                      <TableHead>Pago em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beneficios.data!.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">
                          {TIPO_BENEFICIO_LABEL[b.tipoBeneficio] ?? b.tipoBeneficio}
                        </TableCell>
                        <TableCell>
                          {b.tipoBeneficio === "pix"
                            ? formatMoney(b.valorCentavos)
                            : "1 mês grátis"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BENEFICIO_VARIANT[b.status]}>
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(b.createdAt)}</TableCell>
                        <TableCell>{formatDate(b.dataPagamento)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div
          className="text-3xl font-bold"
          style={{ color: highlight ? VITAL.turquoise : "#374151" }}
        >
          {value}
        </div>
        <div className="text-xs text-gray-600 mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
