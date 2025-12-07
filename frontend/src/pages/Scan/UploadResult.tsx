import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CuteCard from "../../components/ui/CuteCard";
import CuteButton from "../../components/ui/CuteButton";
import CuteSection from "../../components/ui/CuteSection";
import { Download, Check } from "lucide-react";

const UploadResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get("job_id");
  const [status, setStatus] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let mounted = true;
    let intervalId: any;
    const poll = async () => {
      try {
        const { takeJob } = await import("../../services/ocrService");
        const res: any = await takeJob(jobId);
        if (!mounted) return;
        setStatus(res.status || null);
        setPosition(typeof res.position === "number" ? res.position : null);
        setEta(typeof res.eta_seconds === "number" ? res.eta_seconds : null);
        if (res.download_url || res.filename) {
          const url = res.download_url || `${res.filename}`;
          setDownloadUrl(url);
        }
        if (res.chat_id) setChatId(res.chat_id);

        if (res.status === "done" || res.download_url || res.filename) {
          setPolling(false);
          clearInterval(intervalId);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || String(err));
        setPolling(false);
        clearInterval(intervalId);
      }
    };

    setPolling(true);
    poll();
    intervalId = setInterval(poll, 3000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [jobId]);

  const handleDownload = async () => {
    if (!downloadUrl) return;
    try {
      const { downloadFile } = await import("../../services/ocrService");
      if (!downloadUrl.startsWith("http")) {
        const blob = await downloadFile(downloadUrl);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadUrl;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        window.open(downloadUrl, "_blank");
      }
    } catch (err: any) {
      alert(err?.message || "Download failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2">
          Back
        </button>
        <h1 className="text-2xl font-yuruka">Upload Result</h1>
      </div>

      <CuteCard className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-neutral-600">Job ID</p>
            <p className="font-mono text-sm">{jobId}</p>
          </div>

          <div>
            <p className="text-sm text-neutral-600">Status</p>
            <p className="font-bold">{status || "—"}</p>
          </div>

          <div className="flex gap-4">
            <div>
              <p className="text-sm text-neutral-600">Position</p>
              <p>{position ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">ETA (sec)</p>
              <p>{eta ?? "—"}</p>
            </div>
          </div>

          {downloadUrl && (
            <div className="flex gap-2">
              <CuteButton onClick={handleDownload}>Download result</CuteButton>
              {chatId && (
                <CuteButton onClick={() => (window.location.href = `/chat?chat_id=${encodeURIComponent(chatId)}`)}>
                  Open Chat
                </CuteButton>
              )}
            </div>
          )}

          {polling && <p className="text-sm text-neutral-500">Waiting in queue…</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </CuteCard>
    </div>
  );
};

export default UploadResult;