import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Image as ImageIcon, Video, ExternalLink, Filter } from "lucide-react";
import { toast } from "sonner";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";

export default function MateriaisApoio() {
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todas");
  const { data: materiais, isLoading } = trpc.materiaisApoio.list.useQuery();

  const getCategoriaLabel = (cat: string) => {
    switch (cat) {
      case "redes_sociais": return "Redes Sociais";
      case "explicativo": return "Explicativo";
      case "institucional": return "Institucional";
      default: return cat;
    }
  };

  const handleDownload = async (url: string, titulo: string) => {
    try {
      // Abrir em nova aba para download
      window.open(url, '_blank');
      toast.success(`Abrindo ${titulo} para download`);
    } catch (error) {
      toast.error("Erro ao abrir material");
    }
  };

  const materiaisFiltrados = materiais?.filter(m => 
    categoriaFilter === "todas" || m.categoria === categoriaFilter
  ) || [];

  const banners = materiaisFiltrados.filter(m => m.tipo === "banner");
  const videos = materiaisFiltrados.filter(m => m.tipo === "video");

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
    <PainelVendedorLayout>
      <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Materiais de Apoio</h1>
          <p className="text-muted-foreground">Banners e vídeos para suas divulgações</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Categorias</SelectItem>
              <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
              <SelectItem value="explicativo">Explicativo</SelectItem>
              <SelectItem value="institucional">Institucional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Seção de Banners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Banners para Download ({banners.length})
          </CardTitle>
          <CardDescription>
            Imagens prontas para usar em suas redes sociais e divulgações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum banner disponível {categoriaFilter !== "todas" && "nesta categoria"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative group">
                    <img
                      src={banner.urlArquivo}
                      alt={banner.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImagem%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(banner.urlArquivo, banner.titulo)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        asChild
                      >
                        <a href={banner.urlArquivo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver
                        </a>
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-1">{banner.titulo}</CardTitle>
                    <CardDescription className="text-xs">
                      {getCategoriaLabel(banner.categoria)}
                    </CardDescription>
                  </CardHeader>
                  {banner.descricao && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {banner.descricao}
                      </p>
                    </CardContent>
                  )}
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
            Vídeos para Download ({videos.length})
          </CardTitle>
          <CardDescription>
            Vídeos explicativos e institucionais para compartilhar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum vídeo disponível {categoriaFilter !== "todas" && "nesta categoria"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative group">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <Video className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(video.urlArquivo, video.titulo)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        asChild
                      >
                        <a href={video.urlArquivo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Assistir
                        </a>
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-1">{video.titulo}</CardTitle>
                    <CardDescription className="text-xs">
                      {getCategoriaLabel(video.categoria)}
                    </CardDescription>
                  </CardHeader>
                  {video.descricao && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.descricao}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mensagem de ajuda */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Como usar estes materiais</h3>
              <p className="text-sm text-muted-foreground">
                Clique em "Baixar" para salvar o material em seu dispositivo ou em "Ver/Assistir" para abrir em uma nova aba. 
                Você pode compartilhar estes materiais em suas redes sociais, WhatsApp ou qualquer outro canal de divulgação. 
                Todos os materiais são oficiais e aprovados pela Sua Saúde Vital.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </PainelVendedorLayout>
  );
}
