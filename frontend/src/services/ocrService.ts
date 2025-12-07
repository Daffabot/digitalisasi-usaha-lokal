import { apiRequest } from "../lib/apiClient";

export async function uploadOcr(file: File, fileType: "excel" | "pdf") {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("file-type", fileType);

  if (!["excel", "pdf"].includes(fileType)) throw new Error("Invalid file-type");

  // use apiRequest so token refresh is handled automatically on 401
  const res = await apiRequest(`/ocr`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  return res;
}

export async function takeJob(jobId: string) {
  return apiRequest(`/take/${encodeURIComponent(jobId)}`);
}

export async function downloadFile(filename: string): Promise<Blob | unknown> {
  const res = await apiRequest(`${encodeURIComponent(filename)}`, {
    method: "GET",
    credentials: "include",
  });

  if (res instanceof Response) return res.blob();
  return res;
}

export async function uploadOcrBatch(files: File[], fileType: "excel" | "pdf") {
  const fd = new FormData();
  files.forEach((f) => fd.append("image", f));
  fd.append("file-type", fileType);
  if (!files || files.length === 0) throw new Error("No files provided");
  if (!["excel", "pdf"].includes(fileType)) throw new Error("Invalid file-type");

  return apiRequest(`/ocr/batch`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
}

export async function uploadOcrDirect(file: File, fileType: "excel" | "pdf"): Promise<Blob | unknown> {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("file-type", fileType);
  if (!["excel", "pdf"].includes(fileType)) throw new Error("Invalid file-type");

  const res = await apiRequest(`/ocr/direct`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (res instanceof Response) return res.blob();
  return res;
}
