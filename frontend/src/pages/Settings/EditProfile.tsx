import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, User, AtSign, Save } from "lucide-react";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";
import CuteInput from "../../components/ui/CuteInput";
import { apiRequest } from "../../lib/apiClient";
import { motion } from "framer-motion";
import { getStoredUser } from "../../services/authService";
import getGravatarUrl from "../../lib/gravatar";

const EditProfile = () => {
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Only full_name is editable server-side
      const res = await apiRequest(`/auth/update-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      });

      // If server returns updated user, merge into local storage
      try {
        const stored = getStoredUser() || {};
        const returned = typeof res === "object" && res ? res : {};
        const updated = {
          ...stored,
          ...(returned.user || returned),
          full_name: fullName,
        };
        localStorage.setItem("current_user", JSON.stringify(updated));
      } catch (err) {
        // ignore storage errors
        void err;
      }

      // refresh avatar from gravatar
      try {
        const emailStored = getStoredUser()?.email || email;
        if (emailStored) {
          const u = await getGravatarUrl(emailStored, 200);
          setAvatarUrl(u);
        }
      } catch {
        /* ignore */
      }

      navigate(-1);
    } catch (err) {
      console.warn("Failed to update profile", err);
      // keep user on page so they can retry
    } finally {
      setIsSaving(false);
    }
  };

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    "https://www.gravatar.com/avatar/?d=mp&s=200"
  );

  const _stored = getStoredUser();
  const [fullName, setFullName] = useState<string>(
    _stored?.full_name || "User"
  );
  const [username, setUsername] = useState<string>(_stored?.username || "user");
  const [email, setEmail] = useState<string>(
    _stored?.email || "user@example.com"
  );

  useEffect(() => {
    const stored = getStoredUser();
    const email = stored?.email || "";
    let mounted = true;
    if (email) {
      getGravatarUrl(email, 200)
        .then((u) => {
          if (mounted) setAvatarUrl(u);
        })
        .catch(() => {
          /* ignore */
        });
    }
    // form fields are initialized from storage on first render
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950 pb-20">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft
            size={24}
            className="text-neutral-600 dark:text-neutral-300"
          />
        </button>
        <h1 className="text-xl font-yuruka text-neutral-900 dark:text-white">
          Edit Profile
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-8 max-w-lg mx-auto"
        >
          <CuteSection className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 rounded-full bg-neutral-100 dark:bg-neutral-800 p-1 border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden"
              >
                <img
                  src={
                    avatarUrl || "https://www.gravatar.com/avatar/?d=mp&s=200"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </motion.div>
            </div>
            <p className="text-sm text-neutral-400">
              Gravatar based on your email
            </p>
          </CuteSection>

          <CuteSection delay={0.1} className="space-y-4">
            <CuteInput
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={20} />}
            />
            <CuteInput
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              readOnly
              disabled
              icon={<AtSign size={20} />}
            />
            <CuteInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly
              disabled
              icon={<Mail size={20} />}
            />
          </CuteSection>

          <CuteSection delay={0.2}>
            <CuteButton
              fullWidth
              type="submit"
              className="shadow-accentblue/25"
              disabled={isSaving}
            >
              <Save size={20} /> Save Changes
            </CuteButton>
          </CuteSection>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
