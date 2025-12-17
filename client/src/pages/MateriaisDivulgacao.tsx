import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Mic, 
  MessageSquare, 
  ExternalLink,
  Share2,
  Copy,
  Edit,
  Plus,
  Trash2,
  Loader2,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  FileType,
  Upload,
  Download
} from "lucide-react";
import { toast } from "sonner";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
  white: "#FFFFFF",
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F5F5F5",
};

export default function MateriaisDivulgacao() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  
  const [editandoCentral, setEditandoCentral] = useState(false);
  const [editandoPromocao, setEditandoPromocao] = useState(false);
  const [adicionandoDiverso, setAdicionandoDiverso] = useState(false);
  const [adicionandoPersonalizado, setAdicionandoPersonalizado] = useState(false);

  const [textoCentral, setTextoCentral] = useState("");
  const [textoPromocao, setTextoPromocao] = useState("");
  const [novoMaterialDiverso, setNovoMaterialDiverso] = useState<{ titulo: string; conteudo: string; tipo: "link" | "pdf" | "imagem" | "video" | "texto"; descricao?: string }>({ titulo: "", conteudo: "", tipo: "texto", descricao: "" });
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null);
  const [uploadando, setUploadando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [novoMaterialPersonalizado, setNovoMaterialPersonalizado] = useState({ titulo: "", conteudo: "" });

  // Queries
  const { data: materiaisData, isLoading: loadingCentral, refetch: refetchCentral } = 
    trpc.materiaisDivulgacao.getMateriais.useQuery();
  
  const centralArgumentos = materiaisData?.centralArgumentos || "";
  const promocaoVigente = materiaisData?.promocaoVigente || "";
  
  // Dados de promoção já vêm do getMateriais acima
  
  const { data: materiaisDiversos, isLoading: loadingDiversos, refetch: refetchDiversos } = 
    trpc.materiaisDivulgacao.listMateriaisDiversos.useQuery();
  
  const { data: meusMateriaisPersonalizados, isLoading: loadingPersonalizados, refetch: refetchPersonalizados } = 
    trpc.materiaisDivulgacao.listMeusMateriais.useQuery();
  
  // Link de checkout personalizado
  const { data: linkCheckoutData } = trpc.configuracoesGerais.getMeuLinkCheckout.useQuery();

  // Mutations
  const atualizarCentralMutation = trpc.materiaisDivulgacao.updateCentralArgumentos.useMutation({
    onSuccess: () => {
      toast.success("Central de Argumentos atualizada com sucesso!");
      refetchCentral();
      setEditandoCentral(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar Central de Argumentos");
    },
  });

  const atualizarPromocaoMutation = trpc.materiaisDivulgacao.updatePromocaoVigente.useMutation({
    onSuccess: () => {
      toast.success("Promoção Vigente atualizada com sucesso!");
      refetchCentral();
      setEditandoPromocao(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar Promoção Vigente");
    },
  });

  const adicionarDiversoMutation = trpc.materiaisDivulgacao.createMaterialDiverso.useMutation({
    onSuccess: () => {
      toast.success("Material adicionado com sucesso!");
      refetchDiversos();
      setAdicionandoDiverso(false);
      setNovoMaterialDiverso({ titulo: "", conteudo: "", tipo: "texto" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar material");
    },
  });

  const excluirDiversoMutation = trpc.materiaisDivulgacao.deleteMaterialDiverso.useMutation({
    onSuccess: () => {
      toast.success("Material excluído com sucesso!");
      refetchDiversos();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir material");
    },
  });

  const adicionarPersonalizadoMutation = trpc.materiaisDivulgacao.createMeuMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material personalizado adicionado com sucesso!");
      refetchPersonalizados();
      setAdicionandoPersonalizado(false);
      setNovoMaterialPersonalizado({ titulo: "", conteudo: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar material personalizado");
    },
  });

  const excluirPersonalizadoMutation = trpc.materiaisDivulgacao.deleteMeuMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material personalizado excluído com sucesso!");
      refetchPersonalizados();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir material personalizado");
    },
  });

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login-indicador");
    }
  }, [user, loading, setLocation]);

  const copiarTexto = (texto: string, nome?: string) => {
    navigator.clipboard.writeText(texto);
    toast.success(nome ? `${nome} copiado!` : "Texto copiado!");
  };

  const handleUploadArquivo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };

  const handleAdicionarMaterial = async () => {
    try {
      setUploadando(true);
      let conteudoFinal = novoMaterialDiverso.conteudo;

      // Se for arquivo (pdf, imagem, video) e tem arquivo selecionado, fazer upload
      if ((novoMaterialDiverso.tipo === 'pdf' || novoMaterialDiverso.tipo === 'imagem' || novoMaterialDiverso.tipo === 'video') && arquivoUpload) {
        conteudoFinal = await handleUploadArquivo(arquivoUpload);
      }

      await adicionarDiversoMutation.mutateAsync({
        ...novoMaterialDiverso,
        conteudo: conteudoFinal,
      });

      // Limpar formulário
      setNovoMaterialDiverso({ titulo: "", conteudo: "", tipo: "texto", descricao: "" });
      setArquivoUpload(null);
    } catch (error) {
      toast.error('Erro ao adicionar material');
    } finally {
      setUploadando(false);
    }
  };

  const podeEditar = user?.role === "admin" || user?.role === "comercial";

  // Mostrar loading enquanto verifica autenticação
  if (loading || loadingCentral || loadingDiversos || loadingPersonalizados) {
    return (
      <PainelVendedorLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PainelVendedorLayout>
    );
  }

  // Se não autenticado, não renderizar nada (vai redirecionar)
  if (!user) {
    return null;
  }

  return (
    <PainelVendedorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Recursos</h1>
          <p className="text-muted-foreground mt-1">
            Recursos para promover as assinaturas Vital
          </p>
        </div>

        {/* SEÇÃO: LINK DE CHECKOUT PERSONALIZADO */}
        <Card className="mb-6 border-2" style={{ borderColor: VITAL_COLORS.turquoise }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" style={{ color: VITAL_COLORS.turquoise }} />
                  Meu Link de Checkout Personalizado
                </CardTitle>
                <CardDescription>
                  Use este link para rastrear suas vendas e comissões
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {linkCheckoutData?.link ? (
              <div className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-md">
                  <code className="text-sm break-all">{linkCheckoutData.link}</code>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    style={{ backgroundColor: VITAL_COLORS.turquoise }}
                    onClick={() => copiarTexto(linkCheckoutData.link || "", "Link de Checkout")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(linkCheckoutData.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Link
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Como usar:</strong> Compartilhe este link com seus contatos. Todas as vendas realizadas através dele serão automaticamente creditadas a você!
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Link de checkout não configurado. Entre em contato com o administrador.
              </p>
            )}
          </CardContent>
        </Card>

        {/* SEÇÃO: MATERIAIS EDITÁVEIS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <FileText className="inline mr-2" size={28} />
            Materiais de Venda
          </h2>

          {/* Central de Argumentos */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Central de Argumentos</CardTitle>
                  <CardDescription>
                    Principais argumentos de venda para apresentar as assinaturas Vital
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {podeEditar && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTextoCentral(centralArgumentos || "");
                        setEditandoCentral(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    style={{ backgroundColor: VITAL_COLORS.turquoise }}
                    onClick={() => copiarTexto(centralArgumentos || "", "Central de Argumentos")}
                    disabled={!centralArgumentos}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {centralArgumentos ? (
                <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md">
                  {centralArgumentos}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  Nenhum conteúdo cadastrado ainda.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Promoção Vigente */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Promoção Vigente</CardTitle>
                  <CardDescription>
                    Informações sobre a promoção atual e condições especiais
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {podeEditar && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTextoPromocao(promocaoVigente || "");
                        setEditandoPromocao(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    style={{ backgroundColor: VITAL_COLORS.turquoise }}
                    onClick={() => copiarTexto(promocaoVigente || "", "Promoção Vigente")}
                    disabled={!promocaoVigente}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {promocaoVigente ? (
                <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md">
                  {promocaoVigente}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  Nenhuma promoção cadastrada no momento.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Materiais Diversos */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Materiais Diversos</CardTitle>
                  <CardDescription>
                    Outros materiais de apoio para divulgação
                  </CardDescription>
                </div>
                {podeEditar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdicionandoDiverso(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </Button>
                )}
              </div>
              {/* Filtros */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filtroTipo === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo("todos")}
                  style={filtroTipo === "todos" ? { backgroundColor: VITAL_COLORS.turquoise } : {}}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroTipo === "texto" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo("texto")}
                  style={filtroTipo === "texto" ? { backgroundColor: VITAL_COLORS.turquoise } : {}}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Textos
                </Button>
                <Button
                  variant={filtroTipo === "link" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo("link")}
                  style={filtroTipo === "link" ? { backgroundColor: VITAL_COLORS.turquoise } : {}}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Links
                </Button>
                <Button
                  variant={filtroTipo === "imagem" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo("imagem")}
                  style={filtroTipo === "imagem" ? { backgroundColor: VITAL_COLORS.turquoise } : {}}
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Imagens
                </Button>
                <Button
                  variant={filtroTipo === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo("video")}
                  style={filtroTipo === "video" ? { backgroundColor: VITAL_COLORS.turquoise } : {}}
                >
                  <VideoIcon className="h-4 w-4 mr-1" />
                  Vídeos
                </Button>
                <Button
                  variant={filtroTipo === "pdf" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo("pdf")}
                  style={filtroTipo === "pdf" ? { backgroundColor: VITAL_COLORS.turquoise } : {}}
                >
                  <FileType className="h-4 w-4 mr-1" />
                  PDFs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {materiaisDiversos && materiaisDiversos.length > 0 ? (
                <div className="space-y-4">
                  {materiaisDiversos
                    .filter(material => filtroTipo === "todos" || material.tipo === filtroTipo)
                    .map((material) => {
                    // Determinar ícone baseado no tipo
                    const TipoIcon = material.tipo === "link" ? LinkIcon :
                                    material.tipo === "pdf" ? FileType :
                                    material.tipo === "imagem" ? ImageIcon :
                                    material.tipo === "video" ? VideoIcon :
                                    FileText;

                    return (
                      <div key={material.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TipoIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h3 className="font-semibold">{material.titulo}</h3>
                              {material.descricao && (
                                <p className="text-xs text-muted-foreground">{material.descricao}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {/* Botões específicos por tipo */}
                            {material.tipo === "link" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(material.conteudo, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            {material.tipo === "pdf" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(material.conteudo, "_blank")}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {material.tipo === "video" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(material.conteudo, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            {material.tipo === "texto" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copiarTexto(material.conteudo, material.titulo)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                            {podeEditar && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Deseja realmente excluir este material?")) {
                                    excluirDiversoMutation.mutate({ id: material.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Visualização do conteúdo baseado no tipo */}
                        {material.tipo === "texto" && (
                          <div className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md">
                            {material.conteudo}
                          </div>
                        )}
                        {material.tipo === "imagem" && (
                          <div className="mt-3">
                            <img
                              src={material.conteudo}
                              alt={material.titulo}
                              className="max-w-full h-auto rounded-md border"
                              style={{ maxHeight: "400px" }}
                            />
                          </div>
                        )}
                        {material.tipo === "link" && (
                          <div className="mt-2">
                            <a
                              href={material.conteudo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all"
                            >
                              {material.conteudo}
                            </a>
                          </div>
                        )}
                        {material.tipo === "video" && (
                          <div className="mt-2">
                            <a
                              href={material.conteudo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                            >
                              <VideoIcon className="h-4 w-4" />
                              {material.conteudo}
                            </a>
                          </div>
                        )}
                        {material.tipo === "pdf" && (
                          <div className="mt-2">
                            <a
                              href={material.conteudo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <FileType className="h-4 w-4" />
                              Abrir PDF
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  Nenhum material cadastrado ainda.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Meus Materiais Personalizados */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meus Materiais Personalizados</CardTitle>
                  <CardDescription>
                    Seus materiais exclusivos para compartilhamento
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdicionandoPersonalizado(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Material
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {meusMateriaisPersonalizados && meusMateriaisPersonalizados.length > 0 ? (
                <div className="space-y-4">
                  {meusMateriaisPersonalizados.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{material.titulo}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copiarTexto(material.conteudo, material.titulo)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Deseja realmente excluir este material?")) {
                                excluirPersonalizadoMutation.mutate({ id: material.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md">
                        {material.conteudo}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  Você ainda não adicionou nenhum material personalizado.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Landing Pages das Assinaturas */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <ExternalLink className="inline mr-2" size={28} />
            Landing Pages das Assinaturas
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Compartilhe estes links com seus clientes para apresentar as assinaturas Vital
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Home (Página Principal)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Visão geral dos planos e promoção
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Pessoa Física</h3>
              <p className="text-sm text-gray-600 mb-3">
                Planos para famílias e indivíduos
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/pessoa-fisica" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/pessoa-fisica")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Empresarial</h3>
              <p className="text-sm text-gray-600 mb-3">
                Planos para empresas e funcionários
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/empresarial" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/empresarial")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Planos Completos</h3>
              <p className="text-sm text-gray-600 mb-3">
                Comparação detalhada dos 4 planos
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/planos-completos" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/planos-completos")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Cadastro de Grupos</h3>
              <p className="text-sm text-gray-600 mb-3">
                Formar grupos de 4 pessoas e economizar
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/grupos" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/grupos")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">FAQ (Dúvidas Frequentes)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Respostas para dúvidas comuns
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://assinaturas.suasaudevital.com.br/faq" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://assinaturas.suasaudevital.com.br/faq")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Check-out Venda Direta</h3>
              <p className="text-sm text-gray-600 mb-3">
                Página de checkout para vendas diretas
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://suasaudevital.app.filoo.com.br/checkout?compact=true&team=suasaudevital" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Página
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => copiarTexto("https://suasaudevital.app.filoo.com.br/checkout?compact=true&team=suasaudevital")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Link
              </Button>
            </Card>
          </div>
        </section>

        {/* Recursos Adicionais */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <Share2 className="inline mr-2" size={28} />
            Recursos Adicionais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">QR Code WhatsApp Vendas</h3>
              <p className="text-sm text-gray-600 mb-3">
                QR Codes para contato direto via WhatsApp
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://credenciados.suasaudevital.com.br/qr-codes" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Acessar QR Codes
                </a>
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Convite de Parceiros</h3>
              <p className="text-sm text-gray-600 mb-3">
                Página de credenciamento de parceiros
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://credenciados.suasaudevital.com.br/parceiros" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Convidar Parceiros
                </a>
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Guia do Assinante</h3>
              <p className="text-sm text-gray-600 mb-3">
                Médicos e serviços credenciados
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://credenciados.suasaudevital.com.br" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver Guia
                </a>
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Áudios das Assinaturas</h3>
              <p className="text-sm text-gray-600 mb-3">
                Áudios promocionais para divulgação
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://drive.google.com/drive/folders/1FV_irBOjf_8F_V5ZSvGE2r_GtsNAXV7W" target="_blank" rel="noopener noreferrer">
                  <Mic className="mr-2 h-4 w-4" />
                  Acessar Áudios
                </a>
              </Button>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">Avisar sobre Indicação</h3>
              <p className="text-sm text-gray-600 mb-3">
                Contato direto para notificar indicações
              </p>
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                <a href="https://wa.me/5547933853726" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Abrir WhatsApp
                </a>
              </Button>
            </Card>
          </div>
        </section>
      </div>

      {/* Modal Editar Central de Argumentos */}
      <Dialog open={editandoCentral} onOpenChange={setEditandoCentral}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Central de Argumentos</DialogTitle>
            <DialogDescription>
              Atualize os principais argumentos de venda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="texto-central">Conteúdo</Label>
              <Textarea
                id="texto-central"
                value={textoCentral}
                onChange={(e) => setTextoCentral(e.target.value)}
                rows={12}
                placeholder="Digite os argumentos de venda..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditandoCentral(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => atualizarCentralMutation.mutate({ conteudo: textoCentral })}
              disabled={atualizarCentralMutation.isPending}
            >
              {atualizarCentralMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Promoção Vigente */}
      <Dialog open={editandoPromocao} onOpenChange={setEditandoPromocao}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Promoção Vigente</DialogTitle>
            <DialogDescription>
              Atualize as informações da promoção atual
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="texto-promocao">Conteúdo</Label>
              <Textarea
                id="texto-promocao"
                value={textoPromocao}
                onChange={(e) => setTextoPromocao(e.target.value)}
                rows={12}
                placeholder="Digite as informações da promoção..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditandoPromocao(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => atualizarPromocaoMutation.mutate({ conteudo: textoPromocao })}
              disabled={atualizarPromocaoMutation.isPending}
            >
              {atualizarPromocaoMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Material Diverso */}
      <Dialog open={adicionandoDiverso} onOpenChange={setAdicionandoDiverso}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Material Diverso</DialogTitle>
            <DialogDescription>
              Adicione um novo material de apoio para divulgação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Tipo de Material */}
            <div>
              <Label>Tipo de Material</Label>
              <RadioGroup
                value={novoMaterialDiverso.tipo}
                onValueChange={(value) => {
                  setNovoMaterialDiverso({ ...novoMaterialDiverso, tipo: value as any, conteudo: "" });
                  setArquivoUpload(null);
                }}
                className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setNovoMaterialDiverso({ ...novoMaterialDiverso, tipo: "texto", conteudo: "" })}>
                  <RadioGroupItem value="texto" id="tipo-texto" />
                  <Label htmlFor="tipo-texto" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Texto
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setNovoMaterialDiverso({ ...novoMaterialDiverso, tipo: "link", conteudo: "" })}>
                  <RadioGroupItem value="link" id="tipo-link" />
                  <Label htmlFor="tipo-link" className="flex items-center gap-2 cursor-pointer">
                    <LinkIcon className="h-4 w-4" />
                    Link
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setNovoMaterialDiverso({ ...novoMaterialDiverso, tipo: "imagem", conteudo: "" })}>
                  <RadioGroupItem value="imagem" id="tipo-imagem" />
                  <Label htmlFor="tipo-imagem" className="flex items-center gap-2 cursor-pointer">
                    <ImageIcon className="h-4 w-4" />
                    Imagem
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setNovoMaterialDiverso({ ...novoMaterialDiverso, tipo: "video", conteudo: "" })}>
                  <RadioGroupItem value="video" id="tipo-video" />
                  <Label htmlFor="tipo-video" className="flex items-center gap-2 cursor-pointer">
                    <VideoIcon className="h-4 w-4" />
                    Vídeo
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent" onClick={() => setNovoMaterialDiverso({ ...novoMaterialDiverso, tipo: "pdf", conteudo: "" })}>
                  <RadioGroupItem value="pdf" id="tipo-pdf" />
                  <Label htmlFor="tipo-pdf" className="flex items-center gap-2 cursor-pointer">
                    <FileType className="h-4 w-4" />
                    PDF
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Título */}
            <div>
              <Label htmlFor="titulo-diverso">Título *</Label>
              <Input
                id="titulo-diverso"
                value={novoMaterialDiverso.titulo}
                onChange={(e) => setNovoMaterialDiverso({ ...novoMaterialDiverso, titulo: e.target.value })}
                placeholder="Ex: Benefícios da Assinatura Vital"
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="descricao-diverso">Descrição (opcional)</Label>
              <Input
                id="descricao-diverso"
                value={novoMaterialDiverso.descricao || ""}
                onChange={(e) => setNovoMaterialDiverso({ ...novoMaterialDiverso, descricao: e.target.value })}
                placeholder="Breve descrição do material"
              />
            </div>

            {/* Campo dinâmico baseado no tipo */}
            {novoMaterialDiverso.tipo === "texto" && (
              <div>
                <Label htmlFor="conteudo-diverso">Conteúdo *</Label>
                <Textarea
                  id="conteudo-diverso"
                  value={novoMaterialDiverso.conteudo}
                  onChange={(e) => setNovoMaterialDiverso({ ...novoMaterialDiverso, conteudo: e.target.value })}
                  rows={10}
                  placeholder="Digite o conteúdo do material..."
                />
              </div>
            )}

            {novoMaterialDiverso.tipo === "link" && (
              <div>
                <Label htmlFor="url-link">URL do Link *</Label>
                <Input
                  id="url-link"
                  type="url"
                  value={novoMaterialDiverso.conteudo}
                  onChange={(e) => setNovoMaterialDiverso({ ...novoMaterialDiverso, conteudo: e.target.value })}
                  placeholder="https://exemplo.com"
                />
              </div>
            )}

            {novoMaterialDiverso.tipo === "video" && (
              <div>
                <Label htmlFor="url-video">URL do Vídeo *</Label>
                <Input
                  id="url-video"
                  type="url"
                  value={novoMaterialDiverso.conteudo}
                  onChange={(e) => setNovoMaterialDiverso({ ...novoMaterialDiverso, conteudo: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole o link do YouTube, Vimeo ou outro serviço de vídeo
                </p>
              </div>
            )}

            {(novoMaterialDiverso.tipo === "imagem" || novoMaterialDiverso.tipo === "pdf") && (
              <div>
                <Label htmlFor="arquivo-upload">
                  {novoMaterialDiverso.tipo === "imagem" ? "Imagem" : "Arquivo PDF"} *
                </Label>
                <div className="mt-2">
                  <Input
                    id="arquivo-upload"
                    type="file"
                    accept={novoMaterialDiverso.tipo === "imagem" ? "image/*" : ".pdf"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setArquivoUpload(file);
                      }
                    }}
                  />
                  {arquivoUpload && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Arquivo selecionado: {arquivoUpload.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAdicionandoDiverso(false);
              setNovoMaterialDiverso({ titulo: "", conteudo: "", tipo: "texto", descricao: "" });
              setArquivoUpload(null);
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdicionarMaterial}
              disabled={uploadando || !novoMaterialDiverso.titulo || 
                (novoMaterialDiverso.tipo === "texto" && !novoMaterialDiverso.conteudo) ||
                (novoMaterialDiverso.tipo === "link" && !novoMaterialDiverso.conteudo) ||
                (novoMaterialDiverso.tipo === "video" && !novoMaterialDiverso.conteudo) ||
                ((novoMaterialDiverso.tipo === "imagem" || novoMaterialDiverso.tipo === "pdf") && !arquivoUpload)
              }
            >
              {uploadando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {uploadando ? "Enviando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Material Personalizado */}
      <Dialog open={adicionandoPersonalizado} onOpenChange={setAdicionandoPersonalizado}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Material Personalizado</DialogTitle>
            <DialogDescription>
              Crie seu próprio material exclusivo para compartilhamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo-personalizado">Título</Label>
              <Input
                id="titulo-personalizado"
                value={novoMaterialPersonalizado.titulo}
                onChange={(e) => setNovoMaterialPersonalizado({ ...novoMaterialPersonalizado, titulo: e.target.value })}
                placeholder="Ex: Minha Apresentação Personalizada"
              />
            </div>
            <div>
              <Label htmlFor="conteudo-personalizado">Conteúdo</Label>
              <Textarea
                id="conteudo-personalizado"
                value={novoMaterialPersonalizado.conteudo}
                onChange={(e) => setNovoMaterialPersonalizado({ ...novoMaterialPersonalizado, conteudo: e.target.value })}
                rows={10}
                placeholder="Digite o conteúdo do seu material..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdicionandoPersonalizado(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => adicionarPersonalizadoMutation.mutate(novoMaterialPersonalizado)}
              disabled={adicionarPersonalizadoMutation.isPending || !novoMaterialPersonalizado.titulo || !novoMaterialPersonalizado.conteudo}
            >
              {adicionarPersonalizadoMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PainelVendedorLayout>
  );
}
