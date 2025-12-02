import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Heart } from "lucide-react";
import CuteButton from "../../components/ui/CuteButton";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accentblue/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accentpink/10 rounded-full blur-[100px]" />

      <nav className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-accentblue to-accentpink flex items-center justify-center text-white font-yuruka text-sm shadow-md">
            D
          </div>
          <span className="font-yuruka text-xl dark:text-white">DULO</span>
        </div>
        <CuteButton
          variant="ghost"
          size="sm"
          onClick={() => navigate("/settings")}
        >
          Login
        </CuteButton>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accentblue/10 text-accentblue text-sm font-bold mb-6 border border-accentblue/20">
            Version 2.0 Now Live 🚀
          </span>
          <h1 className="text-5xl md:text-7xl font-yuruka text-neutral-900 dark:text-white leading-tight mb-6">
            Digitize your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-accentblue to-accentpink">
              Local Business
            </span>
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto mb-10">
            The cutest way to scan documents, manage records, and organize your
            small business. Simple, fast, and friendly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <CuteButton size="lg" onClick={() => navigate("/home")}>
              Start Now <ArrowRight size={20} />
            </CuteButton>
            <CuteButton variant="secondary" size="lg">
              Learn More
            </CuteButton>
          </div>
        </motion.div>

        <motion.div
          className="mt-16 relative w-full max-w-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* Placeholder Illustration */}
          <motion.img
            src="https://placehold.co/800x400/FF74C8/white?text=Digitalisasi+Usaha+Lokal&font=Poppins"
            alt="App Illustration"
            className="w-full rounded-3xl shadow-2xl shadow-accentpink/20 border-4 border-white dark:border-neutral-800"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />

          {/* Floating badges */}
          <motion.div
            className="absolute -left-4 top-10 bg-white dark:bg-neutral-800 p-3 rounded-2xl shadow-lg flex items-center gap-3"
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <div className="p-2 bg-blue-100 text-accentblue rounded-xl">
              <Zap size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs text-neutral-400">Speed</p>
              <p className="text-sm font-bold dark:text-white">
                Lightning Fast
              </p>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-4 bottom-10 bg-white dark:bg-neutral-800 p-3 rounded-2xl shadow-lg flex items-center gap-3"
            animate={{ x: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <div className="p-2 bg-pink-100 text-accentpink rounded-xl">
              <Heart size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs text-neutral-400">Loved by</p>
              <p className="text-sm font-bold dark:text-white">50k+ Locals</p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
