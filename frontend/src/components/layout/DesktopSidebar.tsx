import { NavLink } from "react-router-dom";
import { Home, ScanLine, Settings, FileText, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

const DesktopSidebar = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: ScanLine, label: "Scan Books", path: "/scan" },
    { icon: FileText, label: "History", path: "/history" }, // Placeholder
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="hidden md:flex fixed top-0 bottom-0 left-0 w-64 p-6 z-50 flex-col">
      <div className="h-full rounded-3xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 shadow-xl flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accentblue to-accentpink flex items-center justify-center text-white font-yuruka text-lg shadow-lg">
            D
          </div>
          <div>
            <h3 className="font-yuruka text-neutral-800 dark:text-white">
              DULO
            </h3>
            <p className="text-xs text-neutral-500">Local Business</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className="block group">
              {({ isActive }) => (
                <div
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
                    isActive
                      ? "bg-accentblue text-white shadow-lg shadow-accentblue/25"
                      : "text-neutral-500 hover:bg-white/50 dark:hover:bg-white/10 hover:text-accentblue"
                  )}
                >
                  <item.icon size={20} />
                  <span className="font-yuruka tracking-wide">
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <NavLink
            to="/"
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-neutral-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} />
            <span className="font-yuruka">Logout</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
