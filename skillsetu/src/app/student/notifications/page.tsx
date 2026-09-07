"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell, Check, Trash2, CheckCircle2,
  AlertCircle, Info, Sparkles, MessageSquare, Briefcase, Presentation
} from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { toast } from "sonner";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "mentorship_message":
        return { icon: Presentation, color: "text-amber-500", bg: "bg-amber-500/10" };
      case "assessment_result":
        return { icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-500/10" };
      case "opportunity_match":
        return { icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "application_update":
        return { icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" };
      case "system_alert":
        return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" };
      default:
        return { icon: Info, color: "text-muted-foreground", bg: "bg-secondary" };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">Loading your updates...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Notifications 
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge variant="default" className="text-sm px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length} New
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated on your assessments, applications, and personalized matches.
          </p>
        </div>
        
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <Check className="w-4 h-4 mr-2" /> Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="border-border/50 border-dashed bg-secondary/20">
          <CardContent className="p-16 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">You're all caught up!</p>
            <p className="text-sm">No new notifications at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 overflow-hidden">
          <div className="divide-y divide-border/50">
            {notifications.map((notif) => {
              const { icon: Icon, color, bg } = getIconAndColor(notif.type);
              const payload = notif.payload_json || {};
              const title = typeof payload.title === "string" ? payload.title : "Notification";
              const message = typeof payload.message === "string" ? payload.message : "";
              const link = typeof payload.link === "string" ? payload.link : null;
              
              return (
                <div 
                  key={notif.id} 
                  className={`p-4 transition-colors hover:bg-secondary/30 flex gap-4 ${notif.read ? 'opacity-75 bg-background' : 'bg-primary/5'}`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm ${notif.read ? 'font-medium' : 'font-bold'}`}>
                        {title}
                      </h4>
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {message}
                    </p>
                    {link && (
                      <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
                        <Link href={link}>View Details</Link>
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end justify-between shrink-0 ml-2">
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive mt-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
