import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Upload, Image, Video, ExternalLink } from "lucide-react";

export default function AdminMateriaisApoio() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<"banner" | "video">("banner");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<"redes_sociais" | "explicativo" | "institucional">("redes_sociais");
  const [urlArquivo, setUrlArquivo] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [ordem, setOrdem] = useState(0);

  const utils = trpc.useUtils();
  const { data: materiais, isLoading } = trpc.materiaisApoio.list.useQuery();
  const addMutation = trpc.materiaisApoio.add.useMutation({
    onSuccess: () => {
      toast.success("Material adicionado com sucesso!");
      utils.materiaisApoio.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar material: ${error.message}`);
    },
  });

  const updateMutation = trpc.materiaisApoio.update.useMutation({
    onSuccess: () => {
      toast.success("Material atualizado com sucesso!");
      utils.materiaisApoio.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar material: ${error.message}`);
    },
  });

  const deleteMutation = trpc.materiaisApoio.delete.useMutation({
    onSuccess: () => {
      toast.success("Material excluído com sucesso!");
      utils.materiaisApoio.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir material: ${error.message}`);
    },
  });

  const resetForm = () => {
    setIsEditMode(false);
    setEditingId(null);
    setTipo("banner");
    setTitulo("");
    setDescricao("");
    setCategoria("redes_sociais");
    setUrlArquivo("");
    setThumbnailUrl("");
    setOrdem(0);
  };

  const handleEdit = (material: any) => {
    setIsEditMode(true);
    setEditingId(material.id);
    setTipo(material.tipo);
    setTitulo(material.titulo);
    setDescricao(material.descricao || "");
    setCategoria(material.categoria);
    setUrlArquivo(material.urlArquivo);
    setThumbnailUrl(material.thumbnailUrl || "");
    setOrdem(material.ordem || 0);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo || !urlArquivo) {
      toast.error("Título e URL do arquivo são obrigatórios");
      return;
    }

    if (isEditMode && editingId) {
      updateMutation.mutate({
        id: editingId,
        tipo,
        titulo,
        descricao: descricao || undefined,
        categoria,
        urlArquivo,
        thumbnailUrl: thumbnailUrl || undefined,
        ordem,
      });
    } else {
      addMutation.mutate({
        tipo,
        titulo,
        descricao: descricao || undefined,
        categoria,
        urlArquivo,
        thumbnailUrl: thumbnailUrl || undefined,
        ordem,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este material?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getCategoriaLabel = (cat: string) => {
    switch (cat) {
      case "redes_sociais": return "Redes Sociais";
      case "explicativo": return "Explicativo";
      case "institucional": return "Institucional";
      default: return cat;
    }
  };

  const banners = materiais?.filter(m => m.tipo === "banner") || [];
  const videos = materiais?.filter(m => m.tipo === "video") || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando materiais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Materiais de Apoio</h1>
          <p className="text-muted-foreground">Gerencie banners e vídeos para os promotores</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Adicionar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Editar Material" : "Adicionar Novo Material"}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Edite as informações do material" : "Adicione um banner ou vídeo para os promotores baixarem"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Material</Label>
                <Select value={tipo} onValueChange={(value: "banner" | "video") => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner (Imagem)</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder={tipo === "banner" 
                    ? "Sugestões: Banner Instagram Stories | Banner Feed | Banner WhatsApp Status | Banner Facebook | Banner LinkedIn"
                    : "Sugestões: Vídeo Institucional | Como Funciona | Depoimentos | Tutorial de Vendas | FAQ"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição do material..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoria} onValueChange={(value: any) => setCategoria(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                    <SelectItem value="explicativo">Explicativo</SelectItem>
                    <SelectItem value="institucional">Institucional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urlArquivo">URL do Arquivo * {tipo === "banner" ? "(Imagem)" : "(Vídeo)"}</Label>
                <Input
                  id="urlArquivo"
                  type="url"
                  value={urlArquivo}
                  onChange={(e) => setUrlArquivo(e.target.value)}
                  placeholder="https://..."
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Cole a URL do arquivo hospedado (ex: S3, Google Drive, etc.)
                </p>
              </div>

              {tipo === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">URL da Thumbnail (opcional)</Label>
                  <Input
                    id="thumbnailUrl"
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ordem">Ordem de Exibição</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={ordem}
                  onChange={(e) => setOrdem(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground">
                  Materiais com ordem maior aparecem primeiro
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                  {isEditMode 
                    ? (updateMutation.isPending ? "Salvando..." : "Salvar Alterações")
                    : (addMutation.isPending ? "Adicionando..." : "Adicionar Material")
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seção de Banners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Banners ({banners.length})
          </CardTitle>
          <CardDescription>Imagens para redes sociais e divulgação</CardDescription>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum banner cadastrado ainda
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <Card key={banner.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{banner.titulo}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {getCategoriaLabel(banner.categoria)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(banner)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(banner.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {banner.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {banner.descricao}
                      </p>
                    )}
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={banner.urlArquivo}
                        alt={banner.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImagem%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={banner.urlArquivo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Ver Original
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Vídeos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Vídeos ({videos.length})
          </CardTitle>
          <CardDescription>Vídeos explicativos e institucionais</CardDescription>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum vídeo cadastrado ainda
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <Card key={video.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{video.titulo}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {getCategoriaLabel(video.categoria)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(video)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(video.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {video.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.descricao}
                      </p>
                    )}
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={video.urlArquivo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Assistir / Baixar
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
