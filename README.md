# Universal Asymmetric Cryptography Data Exchange Utils

A comprehensive TypeScript library for asymmetric cryptography operations using the **Web Crypto API**. This library provides easy-to-use functions for RSA key generation, encryption, and decryption that work **universally** across all modern JavaScript runtimes.

## 🌍 Universal Compatibility

✅ **Node.js** 16+ (with Web Crypto API)  
✅ **Browsers** (Chrome, Firefox, Safari, Edge)  
✅ **Cloudflare Workers**  
✅ **Deno**  
✅ **Bun**  
✅ **Web Workers & Service Workers**

## Features

- 🔐 **RSA Key Pair Generation**: Create public and private key pairs (CryptoKey & PEM formats)
- 🔒 **Public Key Encryption**: Encrypt data using public keys (RSA-OAEP)
- 🔓 **Private Key Decryption**: Decrypt data using private keys
- 📦 **TypeScript Support**: Full TypeScript support with type definitions
- 🚀 **Multiple Formats**: CommonJS and ES Module support
- 🛡️ **Secure**: Uses Web Crypto API with industry-standard algorithms
- ⚡ **Async/Promise-based**: Modern async API for better performance

## Installation

```bash
npm install asymmetric-cryptography-data-exchange-utils
```

## Quick Start

### Modern Web Crypto API (CryptoKey format)

```typescript
import {
  createKeys,
  encryptWithPubKey,
  decryptWithPrivateKey,
} from "asymmetric-cryptography-data-exchange-utils";

// 1. Generate a key pair (CryptoKey format)
const keyPair = await createKeys(2048);

// 2. Encrypt with public key, decrypt with private key
const message = "Hello, World!";
const encrypted = await encryptWithPubKey(message, keyPair.publicKey);
const decrypted = await decryptWithPrivateKey(encrypted, keyPair.privateKey);

console.log(decrypted); // "Hello, World!"
```

### PEM Format (Node.js-style compatibility)

```typescript
import {
  createKeysPEM,
  encryptWithPubKeyPEM,
  decryptWithPrivateKeyPEM,
} from "asymmetric-cryptography-data-exchange-utils";

// 1. Generate a key pair (PEM format)
const keyPair = await createKeysPEM(2048);

// 2. Encrypt with public key PEM, decrypt with private key PEM
const message = "Hello, World!";
const encrypted = await encryptWithPubKeyPEM(message, keyPair.publicKey);
const decrypted = await decryptWithPrivateKeyPEM(encrypted, keyPair.privateKey);

console.log(decrypted); // "Hello, World!"
```

## API Reference

### CryptoKey API (Recommended)

#### `createKeys(keySize?: number): Promise<KeyPair>`

Creates a new RSA key pair using Web Crypto API.

**Parameters:**

- `keySize` (optional): The size of the key in bits. Default: 2048

**Returns:**

- `Promise<KeyPair>`: Object containing `publicKey` and `privateKey` as CryptoKey objects

**Example:**

```typescript
const keyPair = await createKeys(2048);
console.log(keyPair.publicKey.type); // "public"
console.log(keyPair.publicKey.algorithm); // { name: "RSA-OAEP", ... }
```

#### `encryptWithPubKey(data: string | ArrayBuffer, publicKey: CryptoKey): Promise<EncryptedData>`

Encrypts data using a public CryptoKey (RSA-OAEP padding).

**Parameters:**

- `data`: The string or ArrayBuffer data to encrypt
- `publicKey`: The public CryptoKey

**Returns:**

- `Promise<EncryptedData>`: Object with encrypted ArrayBuffer data

**Example:**

```typescript
const encrypted = await encryptWithPubKey("secret message", keyPair.publicKey);
console.log(encrypted.data); // ArrayBuffer
```

#### `decryptWithPrivateKey(encryptedData: EncryptedData, privateKey: CryptoKey): Promise<string>`

Decrypts data using a private CryptoKey.

**Parameters:**

- `encryptedData`: The encrypted data object
- `privateKey`: The private CryptoKey

**Returns:**

- `Promise<string>`: The decrypted message

### PEM API

#### `createKeysPEM(keySize?: number): Promise<KeyPairPEM>`

Creates a new RSA key pair and exports them as PEM strings.

**Returns:**

- `Promise<KeyPairPEM>`: Object containing `publicKey` and `privateKey` as PEM strings

#### `encryptWithPubKeyPEM(data: string, publicKeyPEM: string): Promise<{data: string, encoding: 'base64'}>`

Encrypts data using a public key PEM string.

#### `decryptWithPrivateKeyPEM(encryptedData: {data: string, encoding: 'base64'}, privateKeyPEM: string): Promise<string>`

Decrypts data using a private key PEM string.

## Type Definitions

```typescript
interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

interface KeyPairPEM {
  publicKey: string;
  privateKey: string;
}

interface EncryptedData {
  data: ArrayBuffer;
}
```

## Platform-Specific Usage

### Node.js

```typescript
import { createKeys } from "asymmetric-cryptography-data-exchange-utils";

// Works with Node.js 16+ Web Crypto API
const keyPair = await createKeys();
```

### Browser

```html
<script type="module">
  import { createKeys } from "https://esm.sh/asymmetric-cryptography-data-exchange-utils";

  const keyPair = await createKeys();
  console.log("Crypto in browser!", keyPair);
</script>
```

### Cloudflare Workers

```typescript
// worker.js
import {
  createKeys,
  encryptWithPubKey,
} from "asymmetric-cryptography-data-exchange-utils";

export default {
  async fetch(request, env, ctx) {
    const keyPair = await createKeys();
    const encrypted = await encryptWithPubKey(
      "Hello from CF Workers!",
      keyPair.publicKey
    );

    return new Response(
      JSON.stringify({
        success: true,
        keyType: keyPair.publicKey.type,
      })
    );
  },
};
```

### Deno

```typescript
import { createKeys } from "npm:asymmetric-cryptography-data-exchange-utils";

const keyPair = await createKeys();
console.log("Crypto in Deno!", keyPair.publicKey.type);
```

## Common Use Cases

### 1. Secure Message Exchange

```typescript
// Alice creates a key pair
const aliceKeys = await createKeys();

// Bob encrypts a message for Alice using her public key
const message = "Secret information for Alice";
const encrypted = await encryptWithPubKey(message, aliceKeys.publicKey);

// Alice decrypts the message using her private key
const decrypted = await decryptWithPrivateKey(encrypted, aliceKeys.privateKey);
```

### 2. Cross-Platform Data Exchange

```typescript
// Server (Node.js) generates keys
const serverKeys = await createKeysPEM();

// Send public key to client (browser/worker)
// Client encrypts data
const clientData = await encryptWithPubKeyPEM(
  "sensitive data",
  serverKeys.publicKey
);

// Server decrypts
const serverDecrypted = await decryptWithPrivateKeyPEM(
  clientData,
  serverKeys.privateKey
);
```

## Development

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

The library includes comprehensive Jest tests with high code coverage, testing all cryptographic operations, error handling, and edge cases across different API formats.

### Example Usage

```bash
# Run the basic usage example
npm run example
```

## Security Notes

- **Key Size**: Use at least 2048 bits for production use (4096 bits recommended for high security)
- **Algorithm**: Uses RSA-OAEP with SHA-256 for encryption
- **Key Storage**: Store private keys securely and never expose them in client-side code
- **Message Size**: RSA encryption has size limits based on key size and padding (~190 bytes for 2048-bit keys)
- **Performance**: Key generation is computationally expensive; consider caching keys when appropriate

## Platform Compatibility Matrix

| Platform           | Web Crypto API | CryptoKey Support | PEM Support | Status       |
| ------------------ | -------------- | ----------------- | ----------- | ------------ |
| Node.js 16+        | ✅             | ✅                | ✅          | Full Support |
| Chrome/Edge        | ✅             | ✅                | ✅          | Full Support |
| Firefox            | ✅             | ✅                | ✅          | Full Support |
| Safari             | ✅             | ✅                | ✅          | Full Support |
| Cloudflare Workers | ✅             | ✅                | ✅          | Full Support |
| Deno               | ✅             | ✅                | ✅          | Full Support |
| Bun                | ✅             | ✅                | ✅          | Full Support |
| Web Workers        | ✅             | ✅                | ✅          | Full Support |

## Migration from Node.js crypto

If you're migrating from the Node.js `crypto` module:

### Before (Node.js crypto)

```typescript
import { generateKeyPairSync, publicEncrypt, privateDecrypt } from "crypto";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const encrypted = publicEncrypt(publicKey, Buffer.from(message));
const decrypted = privateDecrypt(privateKey, encrypted).toString();
```

### After (Universal Web Crypto)

```typescript
import {
  createKeysPEM,
  encryptWithPubKeyPEM,
  decryptWithPrivateKeyPEM,
} from "asymmetric-cryptography-data-exchange-utils";

const { publicKey, privateKey } = await createKeysPEM(2048);

const encrypted = await encryptWithPubKeyPEM(message, publicKey);
const decrypted = await decryptWithPrivateKeyPEM(encrypted, privateKey);
```

## Requirements

- Node.js >= 16.0.0 (for Web Crypto API support)
- Modern browsers with Web Crypto API support
- TypeScript (for development)

## Scripts

- `npm run build` - Build the library for production
- `npm run dev` - Build in watch mode for development
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run example` - Run the usage example

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
