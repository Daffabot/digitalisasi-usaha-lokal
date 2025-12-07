import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "../../services/authService";
import getGravatarUrl from "../../lib/gravatar";
import {
  Moon,
  Sun,
  User,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../context/theme";
import CuteCard from "../../components/ui/CuteCard";
import CuteSection from "../../components/ui/CuteSection";
import { motion } from "framer-motion";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://www.gravatar.com/avatar/?d=mp&s=200"
  );

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    const email = stored?.email || "";
    let mounted = true;
    if (email) {
      getGravatarUrl(email, 200)
        .then((u) => {
          if (mounted) setAvatarUrl(u);
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleMobileLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/");
    } catch (e) {
      console.warn("Logout failed", e);
    } finally {
      setLoggingOut(false);
    }
  };

  const settingSections = [
    {
      title: "Account",
      icon: User,
      items: [
        { label: "Profile", path: "/settings/profile", icon: User },
        { label: "Privacy Policy", path: "/privacy", icon: Shield },
      ],
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        { label: "Help Center", path: "/help", icon: HelpCircle },
        { label: "Terms of Service", path: "/terms", icon: FileText },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-yuruka text-neutral-900 dark:text-white mb-4">
        Settings
      </h1>

      <CuteSection>
        <CuteCard className="flex items-center justify-between p-6 bg-linear-to-r from-accentblue/10 to-accentpink/10 border-accentblue/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center text-2xl shadow-md overflow-hidden">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {getStoredUser()?.full_name || "User"}
              </h3>
              <p className="text-neutral-500 text-sm">
                {getStoredUser()?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/settings/profile")}
            className="text-accentblue text-sm font-bold hover:underline"
          >
            Edit
          </button>
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

            <motion.button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
                theme === "dark" ? "bg-accentblue" : "bg-neutral-200"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-sm"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                style={{
                  x: theme === "dark" ? 24 : 0,
                }}
              />
            </motion.button>
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
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors ${
                  i !== section.items.length - 1
                    ? "border-b border-neutral-100 dark:border-neutral-800"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                    <item.icon size={20} className="text-accentblue" />
                  </div>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={18} className="text-neutral-300" />
              </div>
            ))}
          </CuteCard>
        </CuteSection>
      ))}
      {/* Mobile-only logout button (desktop has logout in DesktopSidebar) */}
      <CuteSection className="md:hidden">
        <CuteCard className="p-0 overflow-hidden">
          <button
            onClick={handleMobileLogout}
            disabled={loggingOut}
            className="w-full p-4 flex items-center justify-between text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
          >
            <span className="font-medium">Logout</span>
            {loggingOut ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
          </button>
        </CuteCard>
      </CuteSection>

      <div className="text-center text-xs text-neutral-400 pb-8">
        <p>DULO App</p>
        <p>Made with ❤️ for Local Businesses</p>
      </div>
    </div>
  );
};

export default Settings;
