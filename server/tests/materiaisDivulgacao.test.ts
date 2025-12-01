import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';
import type { Context } from '../_core/context';

describe('Materiais de Divulgação - tRPC Procedures', () => {
  // Mock context para admin
  const adminContext: Context = {
    user: {
      id: 1,
      openId: 'test-admin-openid',
      name: 'Admin Test',
      email: 'admin@test.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: 'email',
      telefone: null,
      cpf: null,
      chavePix: null,
      banco: null,
      agencia: null,
      conta: null,
      tipoConta: null,
      lastRoleChange: null,
    },
    req: {} as any,
    res: {} as any,
  };

  // Mock context para promotor
  const promotorContext: Context = {
    user: {
      id: 2,
      openId: 'test-promotor-openid',
      name: 'Promotor Test',
      email: 'promotor@test.com',
      role: 'promotor',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: 'email',
      telefone: null,
      cpf: null,
      chavePix: null,
      banco: null,
      agencia: null,
      conta: null,
      tipoConta: null,
      lastRoleChange: null,
    },
    req: {} as any,
    res: {} as any,
  };

  // Mock context para comercial
  const comercialContext: Context = {
    user: {
      id: 3,
      openId: 'test-comercial-openid',
      name: 'Comercial Test',
      email: 'comercial@test.com',
      role: 'comercial',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: 'email',
      telefone: null,
      cpf: null,
      chavePix: null,
      banco: null,
      agencia: null,
      conta: null,
      tipoConta: null,
      lastRoleChange: null,
    },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(adminContext);
  const promotorCaller = appRouter.createCaller(promotorContext);
  const comercialCaller = appRouter.createCaller(comercialContext);

  describe('Central de Argumentos', () => {
    it('Admin deve conseguir atualizar Central de Argumentos', async () => {
      const conteudo = 'Teste de argumentos de venda\n\n1. Benefício 1\n2. Benefício 2';
      
      const result = await caller.materiaisDivulgacao.atualizarCentralArgumentos({
        conteudo,
      });

      expect(result.success).toBe(true);
    });

    it('Comercial deve conseguir atualizar Central de Argumentos', async () => {
      const conteudo = 'Argumentos atualizados pelo comercial';
      
      const result = await comercialCaller.materiaisDivulgacao.atualizarCentralArgumentos({
        conteudo,
      });

      expect(result.success).toBe(true);
    });

    it('Promotor NÃO deve conseguir atualizar Central de Argumentos', async () => {
      const conteudo = 'Tentativa de atualização por promotor';
      
      await expect(
        promotorCaller.materiaisDivulgacao.atualizarCentralArgumentos({ conteudo })
      ).rejects.toThrow();
    });

    it('Todos devem conseguir ler Central de Argumentos', async () => {
      const adminResult = await caller.materiaisDivulgacao.getCentralArgumentos();
      const promotorResult = await promotorCaller.materiaisDivulgacao.getCentralArgumentos();
      const comercialResult = await comercialCaller.materiaisDivulgacao.getCentralArgumentos();

      expect(adminResult).toBeDefined();
      expect(promotorResult).toBeDefined();
      expect(comercialResult).toBeDefined();
      
      // Todos devem ver o mesmo conteúdo
      expect(adminResult?.conteudo).toBe(promotorResult?.conteudo);
      expect(adminResult?.conteudo).toBe(comercialResult?.conteudo);
    });
  });

  describe('Promoção Vigente', () => {
    it('Admin deve conseguir atualizar Promoção Vigente', async () => {
      const conteudo = 'Promoção de Natal 2024\n\n50% de desconto no primeiro mês!';
      
      const result = await caller.materiaisDivulgacao.atualizarPromocaoVigente({
        conteudo,
      });

      expect(result.success).toBe(true);
    });

    it('Comercial deve conseguir atualizar Promoção Vigente', async () => {
      const conteudo = 'Promoção atualizada pelo comercial';
      
      const result = await comercialCaller.materiaisDivulgacao.atualizarPromocaoVigente({
        conteudo,
      });

      expect(result.success).toBe(true);
    });

    it('Promotor NÃO deve conseguir atualizar Promoção Vigente', async () => {
      const conteudo = 'Tentativa de atualização por promotor';
      
      await expect(
        promotorCaller.materiaisDivulgacao.atualizarPromocaoVigente({ conteudo })
      ).rejects.toThrow();
    });

    it('Todos devem conseguir ler Promoção Vigente', async () => {
      const result = await promotorCaller.materiaisDivulgacao.getPromocaoVigente();
      expect(result).toBeDefined();
    });
  });

  describe('Materiais Diversos', () => {
    let materialId: number;

    it('Admin deve conseguir adicionar Material Diverso', async () => {
      const result = await caller.materiaisDivulgacao.adicionarMaterialDiverso({
        titulo: 'Benefícios da Assinatura Vital',
        conteudo: '1. Consultas ilimitadas\n2. Exames com desconto\n3. Telemedicina 24h',
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      materialId = result.id!;
    });

    it('Comercial deve conseguir adicionar Material Diverso', async () => {
      const result = await comercialCaller.materiaisDivulgacao.adicionarMaterialDiverso({
        titulo: 'Material do Comercial',
        conteudo: 'Conteúdo teste',
      });

      expect(result.success).toBe(true);
    });

    it('Promotor NÃO deve conseguir adicionar Material Diverso', async () => {
      await expect(
        promotorCaller.materiaisDivulgacao.adicionarMaterialDiverso({
          titulo: 'Tentativa de promotor',
          conteudo: 'Teste',
        })
      ).rejects.toThrow();
    });

    it('Todos devem conseguir listar Materiais Diversos', async () => {
      const result = await promotorCaller.materiaisDivulgacao.getMateriaisDiversos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Admin deve conseguir excluir Material Diverso', async () => {
      const result = await caller.materiaisDivulgacao.excluirMaterialDiverso({
        id: materialId,
      });

      expect(result.success).toBe(true);
    });

    it('Promotor NÃO deve conseguir excluir Material Diverso', async () => {
      // Primeiro criar um material como admin
      const createResult = await caller.materiaisDivulgacao.adicionarMaterialDiverso({
        titulo: 'Material para testar exclusão',
        conteudo: 'Teste',
      });

      // Tentar excluir como promotor
      await expect(
        promotorCaller.materiaisDivulgacao.excluirMaterialDiverso({
          id: createResult.id!,
        })
      ).rejects.toThrow();
    });
  });

  describe('Materiais Personalizados do Promotor', () => {
    let materialId: number;

    it('Promotor deve conseguir adicionar seu próprio Material Personalizado', async () => {
      const result = await promotorCaller.materiaisDivulgacao.adicionarMaterialPersonalizado({
        titulo: 'Minha Apresentação Personalizada',
        conteudo: 'Olá! Sou o João e quero compartilhar com você os benefícios da Vital...',
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      materialId = result.id!;
    });

    it('Admin também deve conseguir adicionar Material Personalizado', async () => {
      const result = await caller.materiaisDivulgacao.adicionarMaterialPersonalizado({
        titulo: 'Material do Admin',
        conteudo: 'Conteúdo teste',
      });

      expect(result.success).toBe(true);
    });

    it('Promotor deve conseguir listar apenas seus próprios Materiais Personalizados', async () => {
      const result = await promotorCaller.materiaisDivulgacao.getMeusMateriaisPersonalizados();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verificar que todos os materiais pertencem ao promotor
      result.forEach((material) => {
        expect(material.usuarioId).toBe(promotorContext.user!.id);
      });
    });

    it('Admin deve conseguir listar apenas seus próprios Materiais Personalizados', async () => {
      const result = await caller.materiaisDivulgacao.getMeusMateriaisPersonalizados();
      
      expect(Array.isArray(result)).toBe(true);
      
      // Verificar que todos os materiais pertencem ao admin
      result.forEach((material) => {
        expect(material.usuarioId).toBe(adminContext.user!.id);
      });
    });

    it('Promotor deve conseguir excluir seu próprio Material Personalizado', async () => {
      const result = await promotorCaller.materiaisDivulgacao.excluirMaterialPersonalizado({
        id: materialId,
      });

      expect(result.success).toBe(true);
    });

    it('Promotor NÃO deve conseguir excluir Material Personalizado de outro usuário', async () => {
      // Admin cria um material
      const createResult = await caller.materiaisDivulgacao.adicionarMaterialPersonalizado({
        titulo: 'Material do Admin',
        conteudo: 'Teste',
      });

      // Promotor tenta excluir
      await expect(
        promotorCaller.materiaisDivulgacao.excluirMaterialPersonalizado({
          id: createResult.id!,
        })
      ).rejects.toThrow();
    });
  });

  describe('Permissões e Segurança', () => {
    it('Usuário não autenticado NÃO deve conseguir acessar nenhuma procedure', async () => {
      const unauthenticatedContext: Context = {
        user: null,
        req: {} as any,
        res: {} as any,
      };
      const unauthenticatedCaller = appRouter.createCaller(unauthenticatedContext);

      await expect(
        unauthenticatedCaller.materiaisDivulgacao.getCentralArgumentos()
      ).rejects.toThrow();

      await expect(
        unauthenticatedCaller.materiaisDivulgacao.getPromocaoVigente()
      ).rejects.toThrow();

      await expect(
        unauthenticatedCaller.materiaisDivulgacao.getMateriaisDiversos()
      ).rejects.toThrow();

      await expect(
        unauthenticatedCaller.materiaisDivulgacao.getMeusMateriaisPersonalizados()
      ).rejects.toThrow();
    });
  });
});
