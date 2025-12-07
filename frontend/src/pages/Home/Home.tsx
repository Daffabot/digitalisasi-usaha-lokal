import React from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../services/authService";
import { UploadCloud, FileClock, ChevronRight, Plus } from "lucide-react";
import CuteCard from "../../components/ui/CuteCard";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const recentDocs = [
    { id: 1, name: "Invoice_Mar_001.pdf", date: "2 mins ago", size: "1.2 MB" },
    { id: 2, name: "Contract_Vendor_A.jpg", date: "Yesterday", size: "3.4 MB" },
    { id: 3, name: "Receipt_Lunch.png", date: "2 days ago", size: "0.8 MB" },
  ];

  const stored = getStoredUser();
  const displayName =
    (stored?.full_name ?? "user").trim().split(/\s+/)[0] || "user";

  return (
    <div className="flex flex-col gap-6">
      <CuteSection>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-yuruka text-neutral-900 dark:text-white mb-1">
              Hello, {displayName}! 👋
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Here is what's happening today.
            </p>
          </div>
          <CuteButton size="sm" onClick={() => navigate("/scan")}>
            <Plus size={18} /> New Scan
          </CuteButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CuteCard className="bg-linear-to-br from-accentblue to-blue-400 text-white border-none">
            <div className="flex flex-col h-full justify-between">
              <div className="p-3 bg-white/20 w-fit rounded-xl mb-4">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Uploads</p>
                <h3 className="text-3xl font-yuruka">1,248</h3>
              </div>
            </div>
          </CuteCard>

          <CuteCard className="bg-linear-to-br from-accentpink to-pink-400 text-white border-none">
            <div className="flex flex-col h-full justify-between">
              <div className="p-3 bg-white/20 w-fit rounded-xl mb-4">
                <FileClock size={24} />
              </div>
              <div>
                <p className="text-pink-100 text-sm mb-1">Pending Review</p>
                <h3 className="text-3xl font-yuruka">12</h3>
              </div>
            </div>
          </CuteCard>

          <CuteCard
            className="flex flex-col justify-center items-center text-center gap-2 border-dashed border-2 border-neutral-300 dark:border-neutral-700 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
            onClick={() => navigate("/scan")}
          >
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <Plus size={24} />
            </div>
            <p className="font-bold text-neutral-600 dark:text-neutral-300">
              Quick Scan
            </p>
          </CuteCard>
        </div>
      </CuteSection>

      <CuteSection delay={0.2}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-yuruka text-neutral-800 dark:text-white">
            Recent Documents
          </h2>
          <button
            className="text-accentblue text-sm font-bold hover:underline"
            onClick={() => navigate("/history")}
          >
            View All
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {recentDocs.map((doc) => (
            <CuteCard
              key={doc.id}
              className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/80 cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-accentblue flex items-center justify-center">
                  <FileClock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-800 dark:text-neutral-200">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {doc.date} • {doc.size}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-neutral-300 group-hover:text-accentblue transition-colors"
              />
            </CuteCard>
          ))}
        </div>
      </CuteSection>
    </div>
  );
};

export default Home;
