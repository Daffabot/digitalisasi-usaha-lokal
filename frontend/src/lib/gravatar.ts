// Lightweight Gravatar URL helper using Web Crypto (SHA-256 as in your example)
export async function getGravatarUrl(
  email: string,
  size = 80
): Promise<string> {
  const trimmed = (email || "").trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(trimmed);
  // obtain SubtleCrypto in a type-safe way (handles older IE's msCrypto)
  const subtle: SubtleCrypto | undefined =
    crypto?.subtle ??
    (window as unknown as { msCrypto?: { subtle: SubtleCrypto } }).msCrypto
      ?.subtle;
  if (!subtle) {
    throw new Error(
      "Web Cryptography API is not available in this environment"
    );
  }
  const hashBuffer = await subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `https://www.gravatar.com/avatar/${hashHex}?s=${size}&d=identicon`;
}

export default getGravatarUrl;
