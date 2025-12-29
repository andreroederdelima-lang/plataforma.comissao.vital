import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CardRecurso = {
  id: number;
  secao: "recursos_adicionais" | "landing_pages";
  titulo: string;
  descricao: string | null;
  link: string | null;
  icone: string | null;
  ordem: number;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminGerenciarCards() {
  const { user, loading } = useAuth();
  const { data: cards, isLoading } = trpc.cardsRecursos.listAll.useQuery();
  const utils = trpc.useUtils();

  const [modalAberto, setModalAberto] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [cardEditando, setCardEditando] = useState<CardRecurso | null>(null);
  const [cardExcluindo, setCardExcluindo] = useState<CardRecurso | null>(null);

  // Estados do formulário
  const [secao, setSecao] = useState<"recursos_adicionais" | "landing_pages">("recursos_adicionais");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [link, setLink] = useState("");
  const [icone, setIcone] = useState("");
  const [ordem, setOrdem] = useState("0");

  const createMutation = trpc.cardsRecursos.create.useMutation({
    onSuccess: () => {
      toast.success("Card criado com sucesso!");
      utils.cardsRecursos.listAll.invalidate();
      fecharModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar card");
    },
  });

  const updateMutation = trpc.cardsRecursos.update.useMutation({
    onSuccess: () => {
      toast.success("Card atualizado com sucesso!");
      utils.cardsRecursos.listAll.invalidate();
      fecharModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar card");
    },
  });

  const deleteMutation = trpc.cardsRecursos.deletePermanent.useMutation({
    onSuccess: () => {
      toast.success("Card excluído com sucesso!");
      utils.cardsRecursos.listAll.invalidate();
      setModalExcluir(false);
      setCardExcluindo(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir card");
    },
  });

  const abrirModalNovo = () => {
    setCardEditando(null);
    setSecao("recursos_adicionais");
    setTitulo("");
    setDescricao("");
    setLink("");
    setIcone("");
    setOrdem("0");
    setModalAberto(true);
  };

  const abrirModalEditar = (card: CardRecurso) => {
    setCardEditando(card);
    setSecao(card.secao as "recursos_adicionais" | "landing_pages");
    setTitulo(card.titulo);
    setDescricao(card.descricao || "");
    setLink(card.link || "");
    setIcone(card.icone || "");
    setOrdem(String(card.ordem));
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCardEditando(null);
  };

  const handleSalvar = () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (cardEditando) {
      // Atualizar
      updateMutation.mutate({
        id: cardEditando.id,
        secao,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        link: link.trim() || "",
        icone: icone.trim() || undefined,
        ordem: parseInt(ordem) || 0,
      });
    } else {
      // Criar novo
      createMutation.mutate({
        secao,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        link: link.trim() || undefined,
        icone: icone.trim() || undefined,
        ordem: parseInt(ordem) || 0,
      });
    }
  };

  const handleExcluir = () => {
    if (!cardExcluindo) return;
    deleteMutation.mutate({ id: cardExcluindo.id });
  };

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Acesso restrito a administradores
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const cardsRecursosAdicionais = cards?.filter(c => c.secao === "recursos_adicionais") || [];
  const cardsLandingPages = cards?.filter(c => c.secao === "landing_pages") || [];

  return (
    <AdminLayout>
      <div className="container py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Editar Materiais de Divulgação</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie os cards, links e recursos exibidos na página de Materiais
              </p>
            </div>
            <Button onClick={abrirModalNovo} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Novo Card
            </Button>
          </div>

          {/* Seção: Recursos Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Recursos Adicionais
              </CardTitle>
              <CardDescription>
                Cards exibidos na seção "Recursos Adicionais" ({cardsRecursosAdicionais.length} cards)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cardsRecursosAdicionais.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum card cadastrado nesta seção
                  </p>
                ) : (
                  cardsRecursosAdicionais.map(card => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {card.icone && <span className="text-xl">{card.icone}</span>}
                          <h3 className="font-semibold">{card.titulo}</h3>
                          {card.isActive === 0 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              Inativo
                            </span>
                          )}
                        </div>
                        {card.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{card.descricao}</p>
                        )}
                        {card.link && (
                          <p className="text-xs text-blue-600 mt-1 truncate">{card.link}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Ordem: {card.ordem}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalEditar(card as CardRecurso)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCardExcluindo(card as CardRecurso);
                            setModalExcluir(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seção: Landing Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                Landing Pages das Assinaturas
              </CardTitle>
              <CardDescription>
                Cards exibidos na seção "Landing Pages" ({cardsLandingPages.length} cards)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cardsLandingPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum card cadastrado nesta seção
                  </p>
                ) : (
                  cardsLandingPages.map(card => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {card.icone && <span className="text-xl">{card.icone}</span>}
                          <h3 className="font-semibold">{card.titulo}</h3>
                          {card.isActive === 0 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              Inativo
                            </span>
                          )}
                        </div>
                        {card.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{card.descricao}</p>
                        )}
                        {card.link && (
                          <p className="text-xs text-blue-600 mt-1 truncate">{card.link}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Ordem: {card.ordem}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalEditar(card as CardRecurso)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCardExcluindo(card as CardRecurso);
                            setModalExcluir(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Criar/Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {cardEditando ? "Editar Card" : "Novo Card"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do card que será exibido na página de Materiais de Divulgação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Seção *</Label>
              <Select value={secao} onValueChange={(v: any) => setSecao(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recursos_adicionais">Recursos Adicionais</SelectItem>
                  <SelectItem value="landing_pages">Landing Pages das Assinaturas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Ex: QR Code WhatsApp Vendas"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Ex: QR Codes para contato direto via WhatsApp"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Link (URL)</Label>
              <Input
                type="url"
                placeholder="https://exemplo.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                URL completa para onde o card deve redirecionar
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ícone (Emoji)</Label>
              <Input
                placeholder="Ex: 📱 ou 🌐"
                value={icone}
                onChange={(e) => setIcone(e.target.value)}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Use um emoji que represente o card
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                min="0"
                value={ordem}
                onChange={(e) => setOrdem(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Quanto menor o número, mais no topo aparece (0 = primeiro)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={fecharModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {cardEditando ? "Salvar Alterações" : "Criar Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <Dialog open={modalExcluir} onOpenChange={setModalExcluir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o card "{cardExcluindo?.titulo}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalExcluir(false);
                setCardExcluindo(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleExcluir}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
