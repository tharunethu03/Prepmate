"use client";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoaderOne } from "@/components/ui/loader";

type PrivacySettings = {
  showXp: boolean;
  showScore: boolean;
  showAttempts: boolean;
};

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showXp: true,
    showScore: true,
    showAttempts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setPrivacy(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updatePrivacy = async (key: keyof PrivacySettings, value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
      setPrivacy(privacy); // revert
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoaderOne />
      </div>
    );

  return (
    <div className="max-w-xl py-5 flex flex-col gap-8">
      {/* Profile & Account */}
      <div>
        <h3 className="mb-3">Profile & Account</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: "Edit profile", href: "/profile?edit=true" },
            { label: "Change password" },
            { label: "Request creator account" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.href && (window.location.href = item.href)}
              className="w-full border border-border hover:border-accent text-start px-5 py-2.5 rounded-[12px] text-secondary hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button className="w-full border border-error/30 hover:border-error text-start px-5 py-2.5 rounded-[12px] text-error/70 hover:text-error transition-colors">
            Delete account
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div>
        <h3 className="mb-3">Appearance</h3>
        <div className="flex flex-col gap-2">
          <div className="w-full border border-border rounded-[12px] px-5 py-2.5 flex items-center justify-between text-secondary">
            <span>Dark mode</span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div>
        <h3 className="mb-1">Privacy</h3>
        <p className="text-xs text-secondary mb-3">
          Control what others can see on your public profile.
        </p>
        <div className="flex flex-col gap-2">
          {[
            { label: "Show XP on public profile", key: "showXp" as const },
            {
              label: "Show scores on public profile",
              key: "showScore" as const,
            },
            {
              label: "Show attempt count on public profile",
              key: "showAttempts" as const,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="w-full border border-border rounded-[12px] px-5 py-2.5 flex items-center justify-between text-secondary"
            >
              <span>{item.label}</span>
              <Switch
                checked={privacy[item.key]}
                onCheckedChange={(val) => updatePrivacy(item.key, val)}
                disabled={saving}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
