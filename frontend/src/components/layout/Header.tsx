import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-accentblue to-accentpink flex items-center justify-center text-white font-yuruka text-sm shadow-md">
          D
        </div>
        <span className="font-yuruka text-xl text-neutral-800 dark:text-white">
          DULO
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400" onClick={() => navigate("/settings")}>
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
