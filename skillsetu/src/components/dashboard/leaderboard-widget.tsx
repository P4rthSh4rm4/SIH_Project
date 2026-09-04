"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Award } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
  loading?: boolean;
}

const PODIUM_STYLES = [
  {
    bg: "bg-gradient-to-br from-amber-400/20 to-yellow-500/20",
    border: "border-amber-400/40",
    text: "text-amber-500",
    icon: Trophy,
    label: "🥇",
    size: "w-16 h-16",
    ring: "ring-2 ring-amber-400/50",
  },
  {
    bg: "bg-gradient-to-br from-slate-300/20 to-gray-400/20",
    border: "border-slate-400/40",
    text: "text-slate-400",
    icon: Medal,
    label: "🥈",
    size: "w-14 h-14",
    ring: "ring-2 ring-slate-400/50",
  },
  {
    bg: "bg-gradient-to-br from-amber-700/20 to-orange-600/20",
    border: "border-amber-700/40",
    text: "text-amber-700 dark:text-amber-600",
    icon: Award,
    label: "🥉",
    size: "w-14 h-14",
    ring: "ring-2 ring-amber-700/50",
  },
];

export function LeaderboardWidget({
  entries,
  myRank,
  loading,
}: LeaderboardWidgetProps) {
  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Leaderboard
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            by XP
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No leaderboard data yet. Be the first!
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-3 mb-6 pt-2">
              {podiumOrder.map((entry, displayIdx) => {
                // Map display index back to actual rank index
                const actualIdx =
                  podiumOrder.length >= 3
                    ? [1, 0, 2][displayIdx]
                    : displayIdx;
                const style = PODIUM_STYLES[actualIdx];
                if (!entry || !style) return null;

                const isFirst = actualIdx === 0;

                return (
                  <div
                    key={entry.user_id}
                    className="flex flex-col items-center"
                  >
                    <div className="text-lg mb-1">{style.label}</div>
                    <div
                      className={`${style.size} rounded-full ${style.bg} ${style.ring} flex items-center justify-center text-lg font-bold mb-2`}
                    >
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.name}
                          className={`${style.size} rounded-full object-cover`}
                        />
                      ) : (
                        <span className={style.text}>
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs font-semibold text-center truncate max-w-[80px] ${isFirst ? "text-sm" : ""}`}
                    >
                      {entry.name.split(" ")[0]}
                    </p>
                    <p className={`text-xs font-bold ${style.text}`}>
                      {entry.total_xp.toLocaleString()} XP
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Lv. {entry.level}
                    </p>
                    {/* Podium bar */}
                    <div
                      className={`w-20 mt-2 rounded-t-lg border ${style.border} ${style.bg}`}
                      style={{ height: isFirst ? 60 : actualIdx === 1 ? 44 : 32 }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Ranked List */}
            {rest.length > 0 && (
              <ScrollArea className="max-h-48">
                <div className="space-y-1">
                  {rest.map((entry) => {
                    const isMe = myRank?.user_id === entry.user_id;
                    return (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          isMe
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <span className="w-6 text-right text-xs font-bold text-muted-foreground">
                          #{entry.rank}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt={entry.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            entry.name.charAt(0)
                          )}
                        </div>
                        <span className="flex-1 truncate font-medium">
                          {entry.name}
                          {isMe && (
                            <span className="text-[10px] text-primary ml-1">(You)</span>
                          )}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {entry.total_xp.toLocaleString()} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {/* Own rank highlight (if not in top list) */}
            {myRank &&
              !entries.find((e) => e.user_id === myRank.user_id) && (
                <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                  <span className="w-6 text-right text-xs font-bold">
                    #{myRank.rank}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0 text-primary">
                    {myRank.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate font-medium">
                    {myRank.name}
                    <span className="text-[10px] text-primary ml-1">(You)</span>
                  </span>
                  <span className="text-xs font-semibold">
                    {myRank.total_xp.toLocaleString()} XP
                  </span>
                </div>
              )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
