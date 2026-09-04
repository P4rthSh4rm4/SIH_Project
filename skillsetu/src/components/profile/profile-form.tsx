"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  GitFork,
  Globe,
  Save,
  Loader2,
} from "lucide-react";
import type { ProfileFormData, Gender } from "@/lib/types";

interface ProfileFormProps {
  profile: ProfileFormData;
  onChange: (data: Partial<ProfileFormData>) => void;
  onSave: () => void;
  saving: boolean;
}

/**
 * Main personal details form for the Profile tab.
 */
export function ProfileForm({
  profile,
  onChange,
  onSave,
  saving,
}: ProfileFormProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="profile-name"
                value={profile.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="pl-9"
                placeholder="Your full name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="profile-email"
                value={profile.email}
                readOnly
                disabled
                className="pl-9 opacity-70"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Location + Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="profile-location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="profile-location"
                value={profile.location ?? ""}
                onChange={(e) => onChange({ location: e.target.value })}
                className="pl-9"
                placeholder="City, State"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="profile-phone"
                value={profile.phone ?? ""}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="pl-9"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
        </div>

        {/* Row 3: DOB + Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="profile-dob">Date of Birth</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="profile-dob"
                type="date"
                value={profile.dob ?? ""}
                onChange={(e) => onChange({ dob: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={profile.gender ?? ""}
              onValueChange={(val) => onChange({ gender: val as Gender })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non_binary">Non-Binary</SelectItem>
                <SelectItem value="prefer_not_to_say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="profile-bio">Bio</Label>
          <Textarea
            id="profile-bio"
            value={profile.bio ?? ""}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        {/* Career Objective */}
        <div className="space-y-2">
          <Label htmlFor="profile-objective">Career Objective</Label>
          <Textarea
            id="profile-objective"
            value={profile.career_objective ?? ""}
            onChange={(e) => onChange({ career_objective: e.target.value })}
            placeholder="What are your career goals?"
            rows={3}
          />
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Social & Portfolio</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={profile.linkedin ?? ""}
                onChange={(e) => onChange({ linkedin: e.target.value })}
                className="pl-9"
                placeholder="LinkedIn URL"
              />
            </div>
            <div className="relative">
              <GitFork className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={profile.github ?? ""}
                onChange={(e) => onChange({ github: e.target.value })}
                className="pl-9"
                placeholder="GitHub URL"
              />
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={profile.portfolio_website ?? ""}
                onChange={(e) =>
                  onChange({ portfolio_website: e.target.value })
                }
                className="pl-9"
                placeholder="Portfolio Website"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-gradient-to-r from-primary to-chart-4 text-white hover:opacity-90 shadow-lg shadow-primary/20 min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
