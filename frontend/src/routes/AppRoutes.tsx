import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Landing from "../pages/Landing/Landing";
import Home from "../pages/Home/Home";
import ScanBooks from "../pages/Scan/ScanBooks";
import UploadResult from "../pages/Scan/UploadResult";
import Settings from "../pages/Settings/Settings";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import ChatAssistant from "../pages/Chat/ChatAssistant";
import History from "../pages/History/History";
import DocumentDetail from "../pages/History/DocumentDetail";
import EditProfile from "../pages/Settings/EditProfile";
import HelpCenter from "../pages/Legal/HelpCenter";
import Privacy from "../pages/Legal/Privacy";
import Terms from "../pages/Legal/Terms";
import MobileNavbar from "../components/layout/MobileNavbar";
import DesktopSidebar from "../components/layout/DesktopSidebar";
import Header from "../components/layout/Header";
import { Public, Protected } from "./RouteGuards";

const AppRoutes = () => {
  const location = useLocation();
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/verify-email",
    "/privacy",
    "/terms",
    "/contact",
  ];
  const cleanRoutes = ["/chat", "/history/:id", "/help", "/settings/profile"];
  const isPublicPage = publicRoutes.includes(location.pathname);
  const isCleanPage = cleanRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 overflow-hidden">
      {!isPublicPage && <DesktopSidebar />}

      <div
        className={`flex-1 flex flex-col h-full overflow-hidden relative ${
          !isPublicPage ? "md:pl-64" : ""
        }`}
      >
        {!isCleanPage && !isPublicPage && <Header />}

        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            !isCleanPage && !isPublicPage ? "m-6 mb-24 md:mb-6" : ""
          }`}
        >
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route element={<Public />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route element={<Protected />}>
                <Route path="/home" element={<Home />} />
                <Route path="/scan" element={<ScanBooks />} />
                <Route path="/scan/result" element={<UploadResult />} />
                <Route path="/chat" element={<ChatAssistant />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/profile" element={<EditProfile />} />
                <Route path="/history" element={<History />} />
                <Route path="/history/:id" element={<DocumentDetail />} />
                <Route path="*" element={<Home />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </main>
        {!isCleanPage && !isPublicPage && <MobileNavbar />}
      </div>
    </div>
  );
};

export default AppRoutes;
