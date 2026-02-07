import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminRelatorios() {
  const [vendedorId, setVendedorId] = useState<number | null>(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [gerando, setGerando] = useState(false);

  const { data: vendedores, isLoading: loadingVendedores } = trpc.relatorios.listarVendedoresComComissoes.useQuery();

  const { data: relatorio, refetch, isFetching } = trpc.relatorios.gerarRelatorioComissoes.useQuery(
    {
      vendedorId: vendedorId!,
      dataInicio,
      dataFim,
    },
    {
      enabled: false, // Não buscar automaticamente
    }
  );

  const handleGerarRelatorio = async () => {
    if (!vendedorId) {
      toast.error("Selecione um vendedor");
      return;
    }
    if (!dataInicio || !dataFim) {
      toast.error("Selecione o período");
      return;
    }

    try {
      setGerando(true);
      await refetch();
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
      console.error(error);
    } finally {
      setGerando(false);
    }
  };

  const handleGerarPDF = () => {
    if (!relatorio) {
      toast.error("Gere o relatório primeiro");
      return;
    }

    try {
      const doc = new jsPDF();

      // Cabeçalho
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("RELATÓRIO DE COMISSÕES", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Sua Saúde Vital - Indicações", 105, 28, { align: "center" });

      // Dados do vendedor
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("DADOS DO VENDEDOR/INDICADOR", 14, 40);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Nome: ${relatorio.vendedor.nome}`, 14, 48);
      doc.text(`CPF: ${relatorio.vendedor.cpf}`, 14, 54);
      doc.text(`Chave PIX: ${relatorio.vendedor.chavePix}`, 14, 60);
      doc.text(`Email: ${relatorio.vendedor.email}`, 14, 66);

      // Período
      doc.setFont("helvetica", "bold");
      doc.text(`PERÍODO: ${new Date(relatorio.periodo.inicio).toLocaleDateString("pt-BR")} a ${new Date(relatorio.periodo.fim).toLocaleDateString("pt-BR")}`, 14, 74);

      // Tabela de comissões
      const tableData = relatorio.comissoes.map((c) => [
        new Date(c.data).toLocaleDateString("pt-BR"),
        c.tipo,
        c.nomeCliente,
        c.plano,
        `R$ ${(c.valorComissao / 100).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 80,
        head: [["Data", "Tipo", "Cliente", "Plano", "Comissão"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 50 },
          4: { cellWidth: 30, halign: "right" },
        },
      });

      // Total
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`TOTAL A PAGAR: R$ ${relatorio.totalComissaoFormatado}`, 14, finalY);

      // Rodapé
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
        105,
        285,
        { align: "center" }
      );

      // Salvar PDF
      const filename = `relatorio-comissoes-${relatorio.vendedor.nome.replace(/\s+/g, "-")}-${relatorio.periodo.inicio}-${relatorio.periodo.fim}.pdf`;
      doc.save(filename);

      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Relatórios de Comissões
          </CardTitle>
          <CardDescription>
            Gere relatórios detalhados de comissões por vendedor/indicador para envio ao financeiro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Vendedor */}
          <div className="space-y-2">
            <Label htmlFor="vendedor">Vendedor/Indicador</Label>
            {loadingVendedores ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando vendedores...
              </div>
            ) : (
              <Select value={vendedorId?.toString()} onValueChange={(v) => setVendedorId(parseInt(v))}>
                <SelectTrigger id="vendedor">
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores?.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.nome || v.email} ({v.totalComissoes} comissões)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>

          {/* Botão Gerar Relatório */}
          <Button
            onClick={handleGerarRelatorio}
            disabled={!vendedorId || !dataInicio || !dataFim || gerando || isFetching}
            className="w-full"
          >
            {gerando || isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </Button>

          {/* Resultado do Relatório */}
          {relatorio && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Vendedor:</p>
                    <p>{relatorio.vendedor.nome}</p>
                  </div>
                  <div>
                    <p className="font-semibold">CPF:</p>
                    <p>{relatorio.vendedor.cpf}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Chave PIX:</p>
                    <p>{relatorio.vendedor.chavePix}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Período:</p>
                    <p>
                      {new Date(relatorio.periodo.inicio).toLocaleDateString("pt-BR")} a{" "}
                      {new Date(relatorio.periodo.fim).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Comissões ({relatorio.comissoes.length}):</p>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {relatorio.comissoes.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <p className="font-medium">{c.nomeCliente}</p>
                          <p className="text-muted-foreground text-xs">
                            {c.tipo} - {new Date(c.data).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <p className="font-semibold">R$ {(c.valorComissao / 100).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">TOTAL A PAGAR:</p>
                    <p className="text-2xl font-bold text-primary">R$ {relatorio.totalComissaoFormatado}</p>
                  </div>
                </div>

                <Button onClick={handleGerarPDF} className="w-full" size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Baixar PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
