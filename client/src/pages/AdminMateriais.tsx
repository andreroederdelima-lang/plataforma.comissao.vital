import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Trash2, ExternalLink, Loader2, FileText, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
};

export default function AdminMateriais() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "banner" as "banner" | "flyer" | "logo" | "pdf" | "imagem",
    categoria: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const utils = trpc.useUtils();
  const { data: materiais = [], isLoading } = trpc.materiais.listar.useQuery();
  const criarMutation = trpc.materiais.criar.useMutation({
    onSuccess: () => {
      utils.materiais.listar.invalidate();
      toast.success("Material cadastrado com sucesso!");
      // Limpar formulário
      setFormData({ titulo: "", descricao: "", tipo: "banner", categoria: "" });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar material: ${error.message}`);
    },
  });

  const excluirMutation = trpc.materiais.excluir.useMutation({
    onSuccess: () => {
      utils.materiais.listar.invalidate();
      toast.success("Material excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir material: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande! Máximo: 10MB");
      return;
    }

    // Validar tipo
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido! Use PNG, JPG, SVG ou PDF");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Selecione um arquivo!");
      return;
    }

    if (!formData.titulo) {
      toast.error("Título é obrigatório!");
      return;
    }

    setUploading(true);

    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        await criarMutation.mutateAsync({
          titulo: formData.titulo,
          descricao: formData.descricao || undefined,
          tipo: formData.tipo,
          categoria: formData.categoria || undefined,
          fileData: base64,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
        });

        setUploading(false);
      };

      reader.onerror = () => {
        toast.error("Erro ao ler arquivo");
        setUploading(false);
      };
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este material?")) {
      excluirMutation.mutate({ id });
    }
  };

  if (user?.role !== "admin") {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Botão Voltar */}
        <a href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </a>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Materiais</h1>
          <p className="text-muted-foreground mt-1">
            Faça upload de banners, flyers, logos e PDFs para os promotores
          </p>
        </div>

        {/* Formulário de Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Novo Material</CardTitle>
            <CardDescription>Faça upload de um novo material de divulgação</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Banner Plano Essencial"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="flyer">Flyer</SelectItem>
                      <SelectItem value="logo">Logo</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="imagem">Imagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria (opcional)</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Planos, Promoções, Institucional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o material..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Arquivo * (PNG, JPG, SVG, PDF - Máx: 10MB)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,application/pdf"
                  onChange={handleFileChange}
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fazendo upload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Materiais */}
        <Card>
          <CardHeader>
            <CardTitle>Materiais Cadastrados</CardTitle>
            <CardDescription>
              {materiais.length} {materiais.length === 1 ? "material" : "materiais"} cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Carregando materiais...</p>
              </div>
            ) : materiais.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum material cadastrado ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materiais.map((material: any) => (
                  <Card key={material.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {material.tipo === "pdf" ? (
                        <FileText className="h-16 w-16 text-gray-400" />
                      ) : (
                        <img
                          src={material.url}
                          alt={material.titulo}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `
                              <div class="flex items-center justify-center h-full">
                                <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 truncate">{material.titulo}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {material.tipo} {material.categoria && `• ${material.categoria}`}
                      </p>
                      {material.descricao && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {material.descricao}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <a href={material.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir
                          </a>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                          disabled={excluirMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
