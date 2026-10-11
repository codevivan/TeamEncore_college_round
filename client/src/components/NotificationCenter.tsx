import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Bell, CheckCheck, ShieldCheck, Rocket, GitPullRequest, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePatchworkStore } from '@/lib/patchworkStore';

export function NotificationCenter() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead } = usePatchworkStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'deployment':
        return <Rocket className="w-4 h-4 text-indigo-600" />;
      case 'rollback':
        return <RotateCcw className="w-4 h-4 text-rose-600" />;
      case 'conflict':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <GitPullRequest className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-[#1B133C]/70 hover:text-[#1B133C] hover:bg-black/5 transition-colors focus-visible:outline-none"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass-dropdown shadow-xl border border-white/60">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 bg-white/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1B133C]">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-800">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-medium"
            >
              <CheckCheck className="w-3 h-3" /> Mark read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-black/5">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.link) {
                    setLocation(n.link);
                    setOpen(false);
                  }
                }}
                className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-black/5 transition-colors ${
                  !n.read ? 'bg-indigo-50/40' : ''
                }`}
              >
                <div className="p-1.5 rounded-lg bg-white border border-black/5 shadow-xs shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-[#1B133C] truncate">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
