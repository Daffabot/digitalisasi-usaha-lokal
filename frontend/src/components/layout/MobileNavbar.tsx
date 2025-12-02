import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Settings, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const MobileNavbar = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: ScanLine, label: 'Scan', path: '/scan' },
    { icon: FileText, label: 'History', path: '/history' }, // Placeholder route
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="mx-4 mb-4 rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-2">
        <ul className="flex items-center justify-between px-2">
          {navItems.map((item) => (
            <li key={item.path} className="flex-1">
              <NavLink to={item.path} className="block">
                {({ isActive }) => (
                  <div className="flex flex-col items-center justify-center p-2 relative">
                    {isActive && (
                      <motion.div
                        layoutId="navBubble"
                        className="absolute inset-0 bg-accentblue/10 dark:bg-accentblue/20 rounded-2xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon 
                      size={24} 
                      className={cn(
                        "relative z-10 transition-colors duration-300",
                        isActive ? "text-accentblue" : "text-neutral-400 dark:text-neutral-500"
                      )} 
                    />
                    <span className={cn(
                      "text-[10px] font-yuruka mt-1 relative z-10 transition-colors duration-300",
                      isActive ? "text-accentblue" : "text-neutral-400 dark:text-neutral-500"
                    )}>
                      {item.label}
                    </span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default MobileNavbar;