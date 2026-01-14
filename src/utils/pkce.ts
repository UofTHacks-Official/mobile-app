import * as Crypto from "expo-crypto";

export function base64UrlEncode(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generateCodeVerifier(length = 64): Promise<string> {
  const array = await Crypto.getRandomBytesAsync(length);
  return base64UrlEncode(array.buffer);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generateRandomState(length = 32): Promise<string> {
  const array = await Crypto.getRandomBytesAsync(length);
  return base64UrlEncode(array.buffer);
}
