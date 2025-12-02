import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from '../pages/Landing/Landing';
import Home from '../pages/Home/Home';
import ScanBooks from '../pages/Scan/ScanBooks';
import UploadResult from '../pages/Scan/UploadResult';
import Settings from '../pages/Settings/Settings';
import MobileNavbar from '../components/layout/MobileNavbar';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import Header from '../components/layout/Header';
import { AnimatePresence } from 'framer-motion';

const AppRoutes = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 overflow-hidden">
      {!isLanding && <DesktopSidebar />}
      
      <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${!isLanding ? 'md:pl-64' : ''}`}>
        {!isLanding && <Header />}
        
        <main className={`flex-1 overflow-y-auto ${!isLanding ? 'p-6 pb-24 md:pb-6' : ''}`}>
          <AnimatePresence mode="wait">
             <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Home />} />
              <Route path="/scan" element={<ScanBooks />} />
              <Route path="/scan/result" element={<UploadResult />} />
              <Route path="/settings" element={<Settings />} />
              {/* Fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        {!isLanding && <MobileNavbar />}
      </div>
    </div>
  );
};

export default AppRoutes;
