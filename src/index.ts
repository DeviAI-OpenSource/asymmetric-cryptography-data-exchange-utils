// Compatible with Node.js 16+, browsers, Cloudflare Workers, Deno, and Bun

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface KeyPairPEM {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedData {
  data: ArrayBuffer;
}

/**
 * Creates a new RSA key pair using Web Crypto API
 * @param keySize - The size of the key in bits (default: 2048)
 * @returns A promise that resolves to an object containing the public and private CryptoKeys
 */
export async function createKeys(keySize: number = 2048): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Creates a new RSA key pair and exports them as PEM strings
 * @param keySize - The size of the key in bits (default: 2048)
 * @returns A promise that resolves to an object containing the public and private keys as PEM strings
 */
export async function createKeysPEM(
  keySize: number = 2048
): Promise<KeyPairPEM> {
  const keyPair = await createKeys(keySize);

  const [publicKeyPEM, privateKeyPEM] = await Promise.all([
    exportPublicKeyToPEM(keyPair.publicKey),
    exportPrivateKeyToPEM(keyPair.privateKey),
  ]);

  return {
    publicKey: publicKeyPEM,
    privateKey: privateKeyPEM,
  };
}

/**
 * Encrypts data using a public key (RSA-OAEP)
 * @param data - The data to encrypt (string or ArrayBuffer)
 * @param publicKey - The public CryptoKey
 * @returns A promise that resolves to encrypted data
 */
export async function encryptWithPubKey(
  data: string | ArrayBuffer,
  publicKey: CryptoKey
): Promise<EncryptedData> {
  const dataBuffer =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    dataBuffer
  );

  return {
    data: encrypted,
  };
}

/**
 * Encrypts data using a public key from PEM string
 * @param data - The data to encrypt
 * @param publicKeyPEM - The public key in PEM format
 * @returns A promise that resolves to encrypted data as base64 string
 */
export async function encryptWithPubKeyPEM(
  data: string,
  publicKeyPEM: string
): Promise<{ data: string; encoding: "base64" }> {
  const publicKey = await importPublicKeyFromPEM(publicKeyPEM);
  const encrypted = await encryptWithPubKey(data, publicKey);

  return {
    data: arrayBufferToBase64(encrypted.data),
    encoding: "base64",
  };
}

/**
 * Decrypts data using a private key
 * @param encryptedData - The encrypted data
 * @param privateKey - The private CryptoKey
 * @returns A promise that resolves to the decrypted string
 */
export async function decryptWithPrivateKey(
  encryptedData: EncryptedData,
  privateKey: CryptoKey
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedData.data
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Decrypts data using a private key from PEM string
 * @param encryptedData - The encrypted data object with base64 data
 * @param privateKeyPEM - The private key in PEM format
 * @returns A promise that resolves to the decrypted string
 */
export async function decryptWithPrivateKeyPEM(
  encryptedData: { data: string; encoding: "base64" },
  privateKeyPEM: string
): Promise<string> {
  const privateKey = await importPrivateKeyFromPEM(privateKeyPEM);
  const encryptedBuffer = base64ToArrayBuffer(encryptedData.data);

  const result = await decryptWithPrivateKey(
    { data: encryptedBuffer },
    privateKey
  );

  return result;
}

// Utility functions for key conversion
async function exportPublicKeyToPEM(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", publicKey);
  const exportedAsString = arrayBufferToBase64(exported);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsString
    .match(/.{1,64}/g)
    ?.join("\n")}\n-----END PUBLIC KEY-----`;
}

async function exportPrivateKeyToPEM(privateKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", privateKey);
  const exportedAsString = arrayBufferToBase64(exported);
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsString
    .match(/.{1,64}/g)
    ?.join("\n")}\n-----END PRIVATE KEY-----`;
}

async function importPublicKeyFromPEM(pemKey: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pemKey
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  const binaryDer = base64ToArrayBuffer(pemContents);

  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

async function importPrivateKeyFromPEM(pemKey: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pemKey
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  const binaryDer = base64ToArrayBuffer(pemContents);

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Export all functions as default export as well
export default {
  createKeys,
  createKeysPEM,
  encryptWithPubKey,
  encryptWithPubKeyPEM,
  decryptWithPrivateKey,
  decryptWithPrivateKeyPEM,
};
