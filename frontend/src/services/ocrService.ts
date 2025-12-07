import { apiRequest, BASE_URL } from "../lib/apiClient";

export async function uploadOcr(file: File, fileType: "excel" | "pdf") {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("file-type", fileType);

  const res = await fetch(`${BASE_URL}/ocr`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `OCR upload failed (${res.status})`);
  }
  return res.json();
}

export async function takeJob(jobId: string) {
  return apiRequest(`/take/${encodeURIComponent(jobId)}`);
}

export async function downloadFile(filename: string) {
  const url = `${BASE_URL}/download/${encodeURIComponent(filename)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  return blob;
}

export async function uploadOcrBatch(files: File[], fileType: "excel" | "pdf") {
  const fd = new FormData();
  files.forEach((f) => fd.append("image", f));
  fd.append("file-type", fileType);
  const res = await fetch(`${BASE_URL}/ocr/batch`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) throw new Error(`Batch upload failed (${res.status})`);
  return res.json();
}

export async function uploadOcrDirect(file: File, fileType: "excel" | "pdf") {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("file-type", fileType);
  const res = await fetch(`${BASE_URL}/ocr/direct`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) throw new Error(`Direct OCR failed (${res.status})`);
  return res.blob();
}
