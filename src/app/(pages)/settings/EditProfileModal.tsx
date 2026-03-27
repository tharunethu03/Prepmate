"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { avatars } from "@/data/avatars";
import { INDUSTRY_NAMES, INDUSTRIES } from "@/data/industries";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUser, Github, Linkedin, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type EditProfileModalProps = {
  onClose: () => void;
};

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { data: session, update } = useSession();

  const [selectedAvatar, setSelectedAvatar] = useState(
    session?.user?.avatar ?? avatars[0],
  );
  const [name, setName] = useState(session?.user?.name ?? "");
  const [field, setField] = useState(session?.user?.field ?? "");
  const [roleTitle, setRoleTitle] = useState(session?.user?.roleTitle ?? "");
  const [portfolioLink, setPortfolioLink] = useState(
    session?.user?.portfolioLink ?? "",
  );
  const [linkedinLink, setLinkedinLink] = useState(
    session?.user?.linkedinLink ?? "",
  );
  const [githubLink, setGithubLink] = useState(session?.user?.githubLink ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = !name || !field || !roleTitle || saving;

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          field,
          roleTitle,
          selectedAvatar,
          portfolioLink,
          linkedinLink,
          githubLink,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update profile");
        return;
      }

      const data = await res.json();

      await update({
        name: data.updatedSessionData.name,
        avatar: data.updatedSessionData.avatar,
        roleTitle: data.updatedSessionData.roleTitle,
        field: data.updatedSessionData.field,
        portfolioLink: data.updatedSessionData.portfolioLink,
        linkedinLink: data.updatedSessionData.linkedinLink,
        githubLink: data.updatedSessionData.githubLink,
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4">
      <div className="bg-foreground border-2 border-accent rounded-[22px] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6 md:p-10">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <X className="text-tertiary hover:text-secondary cursor-pointer" />
        </button>

        <h2 className="text-xl font-semibold mb-1">Edit Profile</h2>
        <p className="text-secondary text-sm mb-6">
          Update your profile information
        </p>
        <hr className="border-border mb-6" />

        <div className="flex flex-col md:flex-row gap-10">
          {/* Left — Avatar picker */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Image
                src={selectedAvatar}
                width={90}
                height={90}
                alt="Selected Avatar"
                className="rounded-full border-4 border-foreground ring-3 ring-accent shadow-md w-[90px] h-[90px] object-cover"
              />
              <p className="text-sm font-medium">Choose your Avatar</p>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-5 gap-3 bg-background border border-border rounded-[12px] p-4 max-h-64 overflow-y-auto">
              {avatars.map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  width={60}
                  height={60}
                  alt={`Avatar ${index + 1}`}
                  className={`rounded-full border-1 cursor-pointer transition hover:scale-105 w-[60px]  object-cover ${
                    selectedAvatar === img
                      ? "border-transparent ring-2 ring-accent"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedAvatar(img)}
                />
              ))}
            </div>
          </div>

          {/* Right — Fields */}
          <div className="flex-1 flex flex-col gap-5">
            <div>
              <Label>
                Full Name <span className="text-error">*</span>
              </Label>
              <Input
                className="mt-2"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label>
                Industry / Field <span className="text-error">*</span>
              </Label>
              <Dropdown
                className="mt-2"
                options={INDUSTRY_NAMES}
                placeholder="Select your field"
                onChange={(value) => setField(value)}
                // value={field}
              />
            </div>

            <div>
              <Label>
                Job Title / Role <span className="text-error">*</span>
              </Label>
              <Dropdown
                className="mt-2"
                options={
                  !field ? [] : (INDUSTRIES[field] ?? [])
                }
                placeholder={!field ? "Select field first" : "Select your role"}
                onChange={(value) => setRoleTitle(value)}
                // value={roleTitle}
              />
            </div>

            <div>
              <Label>
                Social Links{" "}
                <span className="text-xs text-tertiary">(Optional)</span>
              </Label>
              <div className="flex flex-col gap-2 mt-2">
                <div className="relative">
                  <FileUser className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary z-5" />
                  <Input
                    className="pl-10"
                    placeholder="Portfolio link"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary z-5" />
                  <Input
                    className="pl-10"
                    placeholder="LinkedIn link"
                    value={linkedinLink}
                    onChange={(e) => setLinkedinLink(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary z-5" />
                  <Input
                    className="pl-10"
                    placeholder="GitHub link"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex gap-3 justify-end mt-2">
              <Button variant="outline" className="px-6" onClick={onClose}>
                Cancel
              </Button>
              <Button
                disabled={isDisabled}
                onClick={handleSubmit}
                className="px-6"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
