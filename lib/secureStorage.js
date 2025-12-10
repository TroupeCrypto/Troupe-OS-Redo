// lib/secureStorage.js

// Small helpers for base64 <-> Uint8Array
function uint8ToBase64(uint8) {
  if (typeof window === "undefined") return "";
  let binary = "";
  uint8.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
}

function base64ToUint8(base64) {
  if (typeof window === "undefined") return new Uint8Array();
  const binary = window.atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const passphraseKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 310000,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJson(payload, passphrase) {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Web Crypto not available in this environment");
  }

  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const data = enc.encode(JSON.stringify(payload));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return {
    v: 1,
    alg: "AES-GCM",
    salt: uint8ToBase64(salt),
    iv: uint8ToBase64(iv),
    cipher: uint8ToBase64(new Uint8Array(cipherBuffer)),
  };
}

export async function decryptJson(bundle, passphrase) {
  if (
    typeof window === "undefined" ||
    !window.crypto?.subtle ||
    !bundle ||
    typeof bundle !== "object"
  ) {
    throw new Error("Invalid environment or bundle");
  }

  const { salt, iv, cipher } = bundle;
  if (!salt || !iv || !cipher) {
    throw new Error("Invalid encrypted bundle");
  }

  const saltBytes = base64ToUint8(salt);
  const ivBytes = base64ToUint8(iv);
  const cipherBytes = base64ToUint8(cipher);
  const key = await deriveKey(passphrase, saltBytes);

  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plainBuffer));
}
