import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";

export const OfflineIndicator = () => {
  const { online, syncStatus, pendingCount } = useOnlineStatus();

  const isSyncing = syncStatus === 'syncing';

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shadow-lg transition-all duration-300",
        online
          ? pendingCount > 0
            ? "bg-accent/20 text-accent border border-accent/30"
            : "bg-success/20 text-success border border-success/30"
          : "bg-destructive/20 text-destructive border border-destructive/30"
      )}
    >
      {online ? (
        <>
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : pendingCount > 0 ? (
            <Cloud className="h-4 w-4" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
          <span>
            {isSyncing
              ? "Syncing..."
              : pendingCount > 0
              ? `${pendingCount} pending`
              : "Online"}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline{pendingCount > 0 ? ` (${pendingCount} pending)` : ""}</span>
        </>
      )}
    </div>
  );
};
