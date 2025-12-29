import { useState } from "react";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, User, Mail, CreditCard, Lock, Save, Eye, EyeOff } from "lucide-react";

export default function MeuPerfil() {
  const { data: perfil, isLoading, refetch } = trpc.perfil.meuPerfil.useQuery();
  
  // Estados para edição de perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [editandoPerfil, setEditandoPerfil] = useState(false);

  // Estados para alteração de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);

  // Mutations
  const atualizarPerfilMutation = trpc.perfil.atualizarPerfil.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      setEditandoPerfil(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
    },
  });

  const alterarSenhaMutation = trpc.perfil.alterarSenha.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alterar senha");
    },
  });

  // Inicializar campos quando perfil carregar
  if (perfil && !editandoPerfil && nome === "") {
    setNome(perfil.nome || "");
    setEmail(perfil.email || "");
    setChavePix(perfil.chavePix || "");
  }

  const handleSalvarPerfil = () => {
    atualizarPerfilMutation.mutate({
      nome: nome || undefined,
      email: email || undefined,
      chavePix: chavePix || undefined,
    });
  };

  const handleAlterarSenha = () => {
    if (novaSenha !== confirmarSenha) {
      toast.error("Nova senha e confirmação não coincidem");
      return;
    }

    alterarSenhaMutation.mutate({
      senhaAtual,
      novaSenha,
      confirmarSenha,
    });
  };

  if (isLoading) {
    return (
      <PainelVendedorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e9d9f]" />
        </div>
      </PainelVendedorLayout>
    );
  }

  return (
    <PainelVendedorLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        {/* Card de Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#1e9d9f]" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize seus dados de cadastro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setEditandoPerfil(true);
                }}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEditandoPerfil(true);
                }}
                placeholder="seu@email.com"
              />
              <p className="text-xs text-gray-500">
                Este email será usado para login e comunicações
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chavePix" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Chave PIX
              </Label>
              <Input
                id="chavePix"
                value={chavePix}
                onChange={(e) => {
                  setChavePix(e.target.value);
                  setEditandoPerfil(true);
                }}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
              <p className="text-xs text-gray-500">
                Esta chave será usada para receber suas comissões
              </p>
            </div>

            {editandoPerfil && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSalvarPerfil}
                  disabled={atualizarPerfilMutation.isPending}
                  className="bg-[#1e9d9f] hover:bg-[#178a8c]"
                >
                  {atualizarPerfilMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNome(perfil?.nome || "");
                    setEmail(perfil?.email || "");
                    setChavePix(perfil?.chavePix || "");
                    setEditandoPerfil(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Segurança */}
        {perfil?.temSenha && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#1e9d9f]" />
                Segurança
              </CardTitle>
              <CardDescription>
                Altere sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={mostrarSenhas ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhas(!mostrarSenhas)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {mostrarSenhas ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input
                  id="novaSenha"
                  type={mostrarSenhas ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmarSenha"
                  type={mostrarSenhas ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Digite novamente a nova senha"
                />
              </div>

              <Button
                onClick={handleAlterarSenha}
                disabled={
                  !senhaAtual ||
                  !novaSenha ||
                  !confirmarSenha ||
                  alterarSenhaMutation.isPending
                }
                className="bg-[#1e9d9f] hover:bg-[#178a8c]"
              >
                {alterarSenhaMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Informações Adicionais */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Tipo de Conta: {perfil?.role === "admin" ? "Administrador" : "Vendedor/Promotor"}
                </h3>
                <p className="text-sm text-blue-700">
                  {perfil?.role === "admin"
                    ? "Você tem acesso total ao sistema, incluindo configurações administrativas."
                    : "Você pode cadastrar vendas e indicações, visualizar comissões e acessar materiais de apoio."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PainelVendedorLayout>
  );
}
