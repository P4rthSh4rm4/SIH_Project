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
    size: "w-18 h-18",
    ring: "ring-2 ring-amber-400/50",
  },
  {
    bg: "bg-gradient-to-br from-slate-300/20 to-gray-400/20",
    border: "border-slate-400/40",
    text: "text-slate-400",
    icon: Medal,
    label: "🥈",
    size: "w-15 h-15",
    ring: "ring-2 ring-slate-400/50",
  },
  {
    bg: "bg-gradient-to-br from-amber-700/20 to-orange-600/20",
    border: "border-amber-700/40",
    text: "text-amber-700 dark:text-amber-600",
    icon: Award,
    label: "🥉",
    size: "w-15 h-15",
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
      <Card className="border-border/40">
        <CardContent className="p-7">
          <div className="h-72 rounded-xl bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboard
          </CardTitle>
          <span className="text-xs text-muted-foreground font-semibold bg-muted px-3 py-1 rounded-full">
            by XP
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="py-10 text-center text-[0.9rem] text-muted-foreground">
            No leaderboard data yet. Be the first!
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-4 mb-7 pt-3">
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
                    className="flex flex-col items-center animate-slide-up"
                    style={{ animationDelay: `${displayIdx * 100}ms` }}
                  >
                    <div className="text-xl mb-1.5">{style.label}</div>
                    <div
                      className={`${style.size} rounded-full ${style.bg} ${style.ring} flex items-center justify-center text-lg font-bold mb-2.5`}
                    >
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.name}
                          className={`${style.size} rounded-full object-cover`}
                        />
                      ) : (
                        <span className={`${style.text} text-xl font-extrabold`}>
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs font-bold text-center truncate max-w-[90px] ${isFirst ? "text-sm" : ""}`}
                    >
                      {entry.name.split(" ")[0]}
                    </p>
                    <p className={`text-xs font-extrabold ${style.text} mt-0.5`}>
                      {entry.total_xp.toLocaleString()} XP
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      Lv. {entry.level}
                    </p>
                    {/* Podium bar */}
                    <div
                      className={`w-22 mt-2.5 rounded-t-xl border ${style.border} ${style.bg}`}
                      style={{ height: isFirst ? 68 : actualIdx === 1 ? 48 : 36 }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Ranked List */}
            {rest.length > 0 && (
              <ScrollArea className="max-h-52">
                <div className="space-y-1">
                  {rest.map((entry) => {
                    const isMe = myRank?.user_id === entry.user_id;
                    return (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[0.9rem] transition-all duration-200 ${
                          isMe
                            ? "bg-primary/10 dark:bg-primary/15 border border-primary/20"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <span className="w-7 text-right text-xs font-bold text-muted-foreground">
                          #{entry.rank}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt={entry.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            entry.name.charAt(0)
                          )}
                        </div>
                        <span className="flex-1 truncate font-semibold">
                          {entry.name}
                          {isMe && (
                            <span className="text-[10px] text-primary ml-1.5 font-bold">(You)</span>
                          )}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
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
                <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 dark:bg-primary/15 border border-primary/20 text-[0.9rem]">
                  <span className="w-7 text-right text-xs font-bold">
                    #{myRank.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0 text-primary">
                    {myRank.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate font-semibold">
                    {myRank.name}
                    <span className="text-[10px] text-primary ml-1.5 font-bold">(You)</span>
                  </span>
                  <span className="text-xs font-bold">
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
