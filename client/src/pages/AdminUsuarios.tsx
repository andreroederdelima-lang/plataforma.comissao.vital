import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { UserPlus, Mail, Edit, Users, Trash2 } from "lucide-react";

export default function AdminUsuarios() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserChavePix, setNewUserChavePix] = useState("");
  
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editChavePix, setEditChavePix] = useState("");

  const utils = trpc.useUtils();
  const { data: usuarios, isLoading } = trpc.usuarios.list.useQuery();
  
  const createMutation = trpc.usuarios.create.useMutation({
    onSuccess: () => {
      toast.success("Vendedor criado com sucesso!");
      utils.usuarios.list.invalidate();
      setIsCreateDialogOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserChavePix("");
    },
    onError: (error) => {
      toast.error(`Erro ao criar vendedor: ${error.message}`);
    },
  });

  const updateMutation = trpc.usuarios.update.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      utils.usuarios.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.usuarios.toggleActive.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "Usuário ativado!" : "Usuário desativado!");
      utils.usuarios.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resendInviteMutation = trpc.usuarios.resendInvite.useMutation({
    onSuccess: () => {
      toast.success("Convite reenviado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao reenviar convite: ${error.message}`);
    },
  });

  const deleteMutation = trpc.usuarios.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário excluído com sucesso!");
      utils.usuarios.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    },
  });

  const handleCreateUser = () => {
    if (!newUserName || !newUserEmail) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }
    createMutation.mutate({
      name: newUserName,
      email: newUserEmail,
      chavePix: newUserChavePix || undefined,
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    updateMutation.mutate({
      userId: selectedUser.id,
      name: editName || undefined,
      email: editEmail || undefined,
      chavePix: editChavePix || undefined,
    });
  };

  const handleToggleActive = (userId: number, currentStatus: number) => {
    toggleActiveMutation.mutate({
      userId,
      isActive: currentStatus === 0,
    });
  };

  const handleResendInvite = (userId: number, userEmail: string) => {
    if (!userEmail) {
      toast.error("Usuário não possui e-mail cadastrado");
      return;
    }
    resendInviteMutation.mutate({ userId });
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate({ userId });
    }
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditChavePix(user.chavePix || "");
    setIsEditDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      admin: "destructive",
      vendedor: "default",
      user: "secondary",
    };
    return <Badge variant={variants[role] || "secondary"}>{role.toUpperCase()}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </AdminLayout>
    );
  }

  const stats = {
    total: usuarios?.length || 0,
    admins: usuarios?.filter(u => u.role === "admin").length || 0,
    vendedores: usuarios?.filter(u => u.role === "vendedor").length || 0,
    ativos: usuarios?.filter(u => u.isActive === 1).length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie vendedores, admins e permissões de acesso
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Vendedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Vendedor</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo vendedor. Um convite será enviado por e-mail.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: João da Silva"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chavePix">Chave PIX (opcional)</Label>
                  <Input
                    id="chavePix"
                    placeholder="CPF, e-mail ou telefone"
                    value={newUserChavePix}
                    onChange={(e) => setNewUserChavePix(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Vendedor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vendedores}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ativos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Gerencie permissões e status de todos os usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table style={{ minWidth: "800px" }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Chave PIX</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "-"}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.chavePix || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isActive === 1}
                              onCheckedChange={() => handleToggleActive(user.id, user.isActive)}
                              disabled={toggleActiveMutation.isPending}
                            />
                            <span className="text-sm">
                              {user.isActive === 1 ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              title="Editar usuário"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleResendInvite(user.id, user.email || "")}
                              disabled={resendInviteMutation.isPending || !user.email}
                              title="Reenviar convite por e-mail"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.name || user.email || "Usuário")}
                              disabled={deleteMutation.isPending}
                              title="Excluir usuário"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize as informações do usuário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-chavePix">Chave PIX</Label>
                <Input
                  id="edit-chavePix"
                  value={editChavePix}
                  onChange={(e) => setEditChavePix(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditUser} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
