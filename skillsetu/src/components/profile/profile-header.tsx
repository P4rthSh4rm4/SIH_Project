"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import type { ProfileFormData } from "@/lib/types";

interface ProfileHeaderProps {
  profile: ProfileFormData;
  onAvatarChange: (file: File) => void;
}

/**
 * Profile header with avatar, name, role badge, and cover gradient.
 * Clicking the avatar opens a file picker for uploading a new photo.
 */
export function ProfileHeader({ profile, onAvatarChange }: ProfileHeaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Cover gradient */}
      <div className="h-28 bg-gradient-to-r from-primary/20 via-chart-4/15 to-chart-2/10 mesh-bg" />

      <CardContent className="relative pb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12">
          {/* Avatar with upload overlay */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative shrink-0 cursor-pointer"
          >
            <Avatar className="w-20 h-20 rounded-2xl border-4 border-card shadow-lg text-xl">
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-chart-4 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAvatarChange(file);
              }}
            />
          </button>

          {/* Name and info */}
          <div className="flex-1 pt-2">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          {/* Role badge */}
          <div className="pt-3">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 capitalize"
            >
              {profile.role.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
