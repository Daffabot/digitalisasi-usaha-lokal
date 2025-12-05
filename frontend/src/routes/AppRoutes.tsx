import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Landing from "../pages/Landing/Landing";
import Home from "../pages/Home/Home";
import ScanBooks from "../pages/Scan/ScanBooks";
import UploadResult from "../pages/Scan/UploadResult";
import Settings from "../pages/Settings/Settings";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ChatAssistant from "../pages/Chat/ChatAssistant";
import History from '../pages/History/History';
import DocumentDetail from '../pages/History/DocumentDetail';
import MobileNavbar from "../components/layout/MobileNavbar";
import DesktopSidebar from "../components/layout/DesktopSidebar";
import Header from "../components/layout/Header";

const AppRoutes = () => {
  const location = useLocation();
  const publicRoutes = ["/", "/login", "/register"];
  const cleanRoutes = ["/chat", "/history/:id"];
  const isPublicPage = publicRoutes.includes(location.pathname);
  const isCleanPage = cleanRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 overflow-hidden">
      {!isPublicPage && <DesktopSidebar />}

      <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${!isPublicPage ? "md:pl-64" : ""}`}>
        {!isCleanPage && !isPublicPage && <Header />}

        <main className={`flex-1 overflow-y-auto ${!isCleanPage ? "m-6 mb-24 md:mb-6" : ""}`}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/home" element={<Home />} />
              <Route path="/scan" element={<ScanBooks />} />
              <Route path="/scan/result" element={<UploadResult />} />
              <Route path="/chat" element={<ChatAssistant />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:id" element={<DocumentDetail />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </main>
        {!isCleanPage && <MobileNavbar />}
      </div>
    </div>
  );
};

export default AppRoutes;
