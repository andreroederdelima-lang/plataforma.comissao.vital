import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import jwt from "jsonwebtoken";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Tentar autenticar via JWT
    const token = opts.req.cookies?.[COOKIE_NAME];
    
    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        openId: string;
        email: string;
        name: string;
        role: string;
      };

      // Buscar usuário no banco usando openId
      const { getUserByOpenId } = await import("../db");
      user = await getUserByOpenId(decoded.openId) || null;
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
