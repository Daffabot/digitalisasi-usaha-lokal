import { Moon, Sun, User, HelpCircle, ArrowRight } from "lucide-react";
import { useTheme } from "../../context/theme";
import CuteCard from "../../components/ui/CuteCard";
import CuteSection from "../../components/ui/CuteSection";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const settingSections = [
    {
      title: "Account",
      icon: User,
      items: ["Profile", "Notifications", "Privacy"],
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: ["Help Center", "Terms of Service"],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-yuruka text-neutral-900 dark:text-white mb-4">
        Settings
      </h1>

      <CuteSection>
        <CuteCard className="flex items-center justify-between p-6 bg-linear-to-r from-accentblue/10 to-accentpink/10 border-accentblue/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center text-2xl shadow-md overflow-hidden">
              <img
                src="https://picsum.photos/200"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Alex Johnson
              </h3>
              <p className="text-neutral-500 text-sm">Free Plan</p>
            </div>
          </div>
          <Button className="text-primary font-yuruka text-sm font-bold">Edit</Button>
        </CuteCard>
      </CuteSection>

      <CuteSection delay={0.1}>
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3 px-2">
          Appearance
        </h2>
        <CuteCard className="p-2">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                {theme === "dark" ? (
                  <Moon size={20} className="text-accentblue" />
                ) : (
                  <Sun size={20} className="text-orange-400" />
                )}
              </div>
              <span className="font-medium text-neutral-700 dark:text-neutral-200">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </div>

            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
          </div>
        </CuteCard>
      </CuteSection>

      {settingSections.map((section, idx) => (
        <CuteSection key={section.title} delay={0.2 + idx * 0.1}>
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3 px-2">
            {section.title}
          </h2>
          <CuteCard className="p-0 overflow-hidden">
            {section.items.map((item, i) => (
              <div
                key={item}
                className={`p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors ${
                  i !== section.items.length - 1
                    ? "border-b border-neutral-100 dark:border-neutral-800"
                    : ""
                }`}
              >
                <span className="text-neutral-700 dark:text-neutral-300">
                  {item}
                </span>
                <ArrowRight size={20} className="text-neutral-300" />
              </div>
            ))}
          </CuteCard>
        </CuteSection>
      ))}
    </div>
  );
};

export default Settings;
