import { trpc } from "@/lib/trpc";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "wouter";

export function NotificationBadge() {
  const { data: unreadCount } = trpc.notificacoes.countUnread.useQuery(undefined, {
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return (
    <Link href="/notificacoes">
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount !== undefined && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
