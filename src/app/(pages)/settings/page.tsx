import { Switch } from "@/components/ui/switch";
import * as SwitchPrimitive from "@radix-ui/react-switch";

const SettingsPage = () => {
  return (
    <div>
      <div className="mt-5">
        <h3>Profile & Account</h3>
        <div className="flex flex-col gap-2 mt-3">
          <button className="w-full border border-border hover:border-accent text-start px-5 py-1.5 rounded-[12px] text-secondary">
            Edit profile
          </button>
          <button className="w-full border border-border hover:border-accent text-start px-5 py-1.5 rounded-[12px] text-secondary">
            Change password
          </button>
          <button className="w-full border border-border hover:border-accent text-start px-5 py-1.5 rounded-[12px] text-secondary">
            Request creator account
          </button>
          <button className="w-full border border-border hover:border-accent text-start px-5 py-1.5 rounded-[12px] text-secondary">
            Delete account
          </button>
        </div>
      </div>
      <div className="mt-5">
        <h3>Appearance</h3>
        <div className="flex flex-col gap-2 mt-3">
          <div className="w-full border border-border hover:border-accent text-start px-5 py-1.5 rounded-[12px] text-secondary flex items-center justify-between">
            Dark mode
            <Switch id="dark-mode-toggle" className="ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
