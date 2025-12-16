import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Heart, CheckIcon } from "lucide-react";
import CuteButton from "../../components/ui/CuteButton";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const scrollToLearnMore = () => {
    const el = document.getElementById("learn-more");
    if (el) el.scrollIntoView({ behavior: "smooth", block: 'nearest', inline: 'start' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accentblue/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accentpink/10 rounded-full blur-[100px]" />

      <nav className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-tr from-accentblue to-accentpink flex items-center justify-center text-white font-yuruka text-sm shadow-md">
            D
          </div>
          <span className="font-yuruka text-xl dark:text-white">DULO</span>
        </div>

        <div className="flex items-center gap-3">
          <CuteButton
            variant="ghost"
            size="sm"
            onClick={() => navigate("/login")}
          >
            Login
          </CuteButton>
          <CuteButton size="sm" onClick={() => navigate("/register")}>
            Get Started
          </CuteButton>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 max-w-6xl mx-auto w-full py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="mx-auto max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accentblue/10 text-accentblue text-sm font-bold mb-6 border border-accentblue/20">
              Version 2.0 — Now Live 🚀
            </span>
            <h1 className="text-4xl md:text-6xl font-yuruka text-neutral-900 dark:text-white leading-tight mb-6">
              <span className="text-accentblue">Digitize</span> your documents. <span className="text-accentpink">Empower</span> your local business.
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
              Scan receipts, organize records, and access searchable OCR on the
              go — designed for small businesses that need fast, reliable
              document digitization without complexity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <CuteButton size="lg" onClick={() => navigate("/login")}>
                Start Now <ArrowRight size={18} />
              </CuteButton>

              <CuteButton
                variant="secondary"
                size="lg"
                onClick={scrollToLearnMore}
                aria-controls="learn-more"
              >
                Learn More
              </CuteButton>
            </div>
          </div>

          <motion.div
            className="mt-16 relative w-full max-w-2xl mx-auto"
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
              <div className="p-2 bg-blue-100 text-accentblue dark:bg-blue-900/40 rounded-xl">
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
              <div className="p-2 bg-pink-100 text-accentpink dark:bg-pink-900/40 rounded-xl">
                <Heart size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-neutral-400">Loved by</p>
                <p className="text-sm font-bold dark:text-white">Local Business</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Learn more / features section */}
      <section
        id="learn-more"
        className="bg-neutral-50 dark:bg-neutral-900 py-16"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white text-center mb-6">
            Why teams love DULO
          </h2>
          <p className="text-center text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-10">
            Built for local businesses: simple onboarding, affordable pricing,
            powerful OCR, and offline-friendly workflows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-accentblue/10 text-accentblue mb-4">
                <Zap size={18} />
              </div>
              <h3 className="font-semibold mb-2">Fast, Accurate OCR</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-300">
                High-accuracy text extraction that preserves layout and tables —
                ready for search and export.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-accentpink/10 text-accentpink mb-4">
                <Heart size={18} />
              </div>
              <h3 className="font-semibold mb-2">Designed for Small Teams</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-300">
                Simple permissions, shareable documents, and workflows that fit
                how local businesses operate.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-green-100 text-green-600 dark:bg-green-900/40 mb-4">
                <CheckIcon size={18} />
              </div>
              <h3 className="font-semibold mb-2">Export & Integrate</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-300">
                Export to PDF, CSV, or integrate with your accounting tools via
                simple APIs.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-4">How it works</h3>
              <ol className="space-y-4 text-neutral-600 dark:text-neutral-400">
                <li>
                  <strong>1.</strong> Snap or upload receipts and documents.
                </li>
                <li>
                  <strong>2.</strong> DULO extracts text, classifies, and makes
                  documents searchable.
                </li>
                <li>
                  <strong>3.</strong> Export, share, or keep records securely in
                  your workspace.
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Ready to try?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Create an account and start digitizing your first documents in
                minutes.
              </p>
              <div className="flex gap-3">
                <CuteButton onClick={() => navigate("/register")}>
                  Create Account
                </CuteButton>
                <CuteButton variant="ghost" onClick={() => navigate("/login")}>
                  Sign in
                </CuteButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA + Footer */}
      <footer className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-accentblue/5 dark:bg-accentblue/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold">
                Ready to move paper to digital?
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Get started with DULO today and streamline your document
                management.
              </p>
            </div>
            <div className="flex gap-3">
              <CuteButton size="md" onClick={() => navigate("/register")}>
                Start
              </CuteButton>
              <CuteButton variant="ghost" onClick={scrollToLearnMore}>
                Learn more
              </CuteButton>
            </div>
          </div>

          <div className="mt-8 text-sm text-neutral-500 dark:text-neutral-400 flex flex-col md:flex-row items-center justify-between">
            <div>
              © {new Date().getFullYear()} DULO — Made with ❤️ for local
              businesses
            </div>
            <div className="flex gap-4 mt-3 md:mt-0">
              <Link to="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link to="/terms" className="hover:underline">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
