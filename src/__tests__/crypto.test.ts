import {
  createKeys,
  createKeysPEM,
  encryptWithPubKey,
  encryptWithPubKeyPEM,
  decryptWithPrivateKey,
  decryptWithPrivateKeyPEM,
  KeyPair,
  KeyPairPEM,
  EncryptedData,
} from "../index";

describe("Asymmetric Cryptography Utils (Web Crypto API)", () => {
  let keyPair: KeyPair;
  let keyPairPEM: KeyPairPEM;

  beforeEach(async () => {
    keyPair = await createKeys(2048);
    keyPairPEM = await createKeysPEM(2048);
  });

  describe("createKeys", () => {
    it("should create a valid key pair with default size", async () => {
      const keys = await createKeys();

      expect(keys).toBeDefined();
      expect(keys.publicKey).toBeDefined();
      expect(keys.privateKey).toBeDefined();
      expect(keys.publicKey).toBeInstanceOf(CryptoKey);
      expect(keys.privateKey).toBeInstanceOf(CryptoKey);
      expect(keys.publicKey.type).toBe("public");
      expect(keys.privateKey.type).toBe("private");
      expect(keys.publicKey.algorithm.name).toBe("RSA-OAEP");
      expect(keys.privateKey.algorithm.name).toBe("RSA-OAEP");
    });

    it("should create a valid key pair with custom size", async () => {
      const keys4096 = await createKeys(4096);

      expect(keys4096).toBeDefined();
      expect(keys4096.publicKey).toBeDefined();
      expect(keys4096.privateKey).toBeDefined();
      expect(keys4096.publicKey.algorithm.name).toBe("RSA-OAEP");
      // @ts-ignore - accessing modulusLength for testing
      expect(keys4096.publicKey.algorithm.modulusLength).toBe(4096);
    });

    it("should create different key pairs on each call", async () => {
      const keys1 = await createKeys();
      const keys2 = await createKeys();

      expect(keys1.publicKey).not.toBe(keys2.publicKey);
      expect(keys1.privateKey).not.toBe(keys2.privateKey);
    });
  });

  describe("createKeysPEM", () => {
    it("should create a valid PEM key pair", async () => {
      const keys = await createKeysPEM();

      expect(keys).toBeDefined();
      expect(keys.publicKey).toBeDefined();
      expect(keys.privateKey).toBeDefined();
      expect(typeof keys.publicKey).toBe("string");
      expect(typeof keys.privateKey).toBe("string");
      expect(keys.publicKey).toContain("-----BEGIN PUBLIC KEY-----");
      expect(keys.publicKey).toContain("-----END PUBLIC KEY-----");
      expect(keys.privateKey).toContain("-----BEGIN PRIVATE KEY-----");
      expect(keys.privateKey).toContain("-----END PRIVATE KEY-----");
    });

    it("should create different PEM key pairs on each call", async () => {
      const keys1 = await createKeysPEM();
      const keys2 = await createKeysPEM();

      expect(keys1.publicKey).not.toBe(keys2.publicKey);
      expect(keys1.privateKey).not.toBe(keys2.privateKey);
    });
  });

  describe("encryptWithPubKey (CryptoKey)", () => {
    it("should encrypt data with public CryptoKey", async () => {
      const message = "Hello, World!";
      const encrypted = await encryptWithPubKey(message, keyPair.publicKey);

      expect(encrypted).toBeDefined();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.data).toBeInstanceOf(ArrayBuffer);
      expect(encrypted.data.byteLength).toBeGreaterThan(0);
    });

    it("should produce different encrypted output for same message", async () => {
      const message = "Hello, World!";
      const encrypted1 = await encryptWithPubKey(message, keyPair.publicKey);
      const encrypted2 = await encryptWithPubKey(message, keyPair.publicKey);

      // RSA with OAEP padding includes random data, so outputs should differ
      expect(new Uint8Array(encrypted1.data)).not.toEqual(
        new Uint8Array(encrypted2.data)
      );
    });

    it("should handle empty strings", async () => {
      const encrypted = await encryptWithPubKey("", keyPair.publicKey);

      expect(encrypted).toBeDefined();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.data).toBeInstanceOf(ArrayBuffer);
    });

    it("should handle ArrayBuffer input", async () => {
      const message = new TextEncoder().encode("Hello, World!");
      const encrypted = await encryptWithPubKey(message, keyPair.publicKey);

      expect(encrypted).toBeDefined();
      expect(encrypted.data).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe("encryptWithPubKeyPEM (PEM)", () => {
    it("should encrypt data with public key PEM", async () => {
      const message = "Hello, World!";
      const encrypted = await encryptWithPubKeyPEM(
        message,
        keyPairPEM.publicKey
      );

      expect(encrypted).toBeDefined();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.encoding).toBe("base64");
      expect(typeof encrypted.data).toBe("string");
      expect(encrypted.data.length).toBeGreaterThan(0);
    });

    it("should handle special characters and unicode", async () => {
      const message = "Hello 🌍! Special chars: @#$%^&*()_+-=[]{}|;:,.<>?";
      const encrypted = await encryptWithPubKeyPEM(
        message,
        keyPairPEM.publicKey
      );

      expect(encrypted).toBeDefined();
      expect(encrypted.data).toBeDefined();
      expect(encrypted.encoding).toBe("base64");
    });
  });

  describe("decryptWithPrivateKey (CryptoKey)", () => {
    it("should decrypt data encrypted with public key", async () => {
      const message = "Hello, World!";
      const encrypted = await encryptWithPubKey(message, keyPair.publicKey);
      const decrypted = await decryptWithPrivateKey(
        encrypted,
        keyPair.privateKey
      );

      expect(decrypted).toBe(message);
    });

    it("should handle special characters and unicode", async () => {
      const message = "Hello 🌍! Special chars: @#$%^&*()_+-=[]{}|;:,.<>?";
      const encrypted = await encryptWithPubKey(message, keyPair.publicKey);
      const decrypted = await decryptWithPrivateKey(
        encrypted,
        keyPair.privateKey
      );

      expect(decrypted).toBe(message);
    });

    it("should handle empty strings", async () => {
      const message = "";
      const encrypted = await encryptWithPubKey(message, keyPair.publicKey);
      const decrypted = await decryptWithPrivateKey(
        encrypted,
        keyPair.privateKey
      );

      expect(decrypted).toBe(message);
    });
  });

  describe("decryptWithPrivateKeyPEM (PEM)", () => {
    it("should decrypt PEM encrypted data", async () => {
      const message = "Hello, World!";
      const encrypted = await encryptWithPubKeyPEM(
        message,
        keyPairPEM.publicKey
      );
      const decrypted = await decryptWithPrivateKeyPEM(
        encrypted,
        keyPairPEM.privateKey
      );

      expect(decrypted).toBe(message);
    });

    it("should handle long messages", async () => {
      const message = "a".repeat(100); // 100 character string
      const encrypted = await encryptWithPubKeyPEM(
        message,
        keyPairPEM.publicKey
      );
      const decrypted = await decryptWithPrivateKeyPEM(
        encrypted,
        keyPairPEM.privateKey
      );

      expect(decrypted).toBe(message);
    });
  });

  describe("Full encryption/decryption cycles", () => {
    it("should complete public->private cycle successfully (CryptoKey)", async () => {
      const message = "This is a secret message!";

      // Encrypt with public key
      const encrypted = await encryptWithPubKey(message, keyPair.publicKey);
      expect(encrypted.data).toBeDefined();

      // Decrypt with private key
      const decrypted = await decryptWithPrivateKey(
        encrypted,
        keyPair.privateKey
      );
      expect(decrypted).toBe(message);
    });

    it("should complete public->private cycle successfully (PEM)", async () => {
      const message = "This is a secret message!";

      // Encrypt with public key PEM
      const encrypted = await encryptWithPubKeyPEM(
        message,
        keyPairPEM.publicKey
      );
      expect(encrypted.data).toBeDefined();

      // Decrypt with private key PEM
      const decrypted = await decryptWithPrivateKeyPEM(
        encrypted,
        keyPairPEM.privateKey
      );
      expect(decrypted).toBe(message);
    });

    it("should not decrypt with wrong key combination", async () => {
      const message = "Hello, World!";
      const otherKeyPair = await createKeys();

      // Encrypt with one public key
      const encrypted = await encryptWithPubKey(message, keyPair.publicKey);

      // Try to decrypt with different private key - should throw
      await expect(async () => {
        await decryptWithPrivateKey(encrypted, otherKeyPair.privateKey);
      }).rejects.toThrow();
    });
  });

  describe("Error handling", () => {
    it("should throw error with invalid PEM public key", async () => {
      const message = "Hello, World!";
      const invalidKey = "invalid-key";

      await expect(async () => {
        await encryptWithPubKeyPEM(message, invalidKey);
      }).rejects.toThrow();
    });

    it("should throw error with invalid encrypted data", async () => {
      const invalidEncrypted: EncryptedData = {
        data: new ArrayBuffer(10), // Invalid encrypted data
      };

      await expect(async () => {
        await decryptWithPrivateKey(invalidEncrypted, keyPair.privateKey);
      }).rejects.toThrow();
    });
  });

  describe("Type safety", () => {
    it("should return correct types for CryptoKey functions", async () => {
      const keys = await createKeys();
      const message = "Hello, World!";

      expect(keys.publicKey).toBeInstanceOf(CryptoKey);
      expect(keys.privateKey).toBeInstanceOf(CryptoKey);

      const encrypted = await encryptWithPubKey(message, keys.publicKey);
      expect(encrypted.data).toBeInstanceOf(ArrayBuffer);

      const decrypted = await decryptWithPrivateKey(encrypted, keys.privateKey);
      expect(typeof decrypted).toBe("string");
    });

    it("should return correct types for PEM functions", async () => {
      const keys = await createKeysPEM();
      const message = "Hello, World!";

      expect(typeof keys.publicKey).toBe("string");
      expect(typeof keys.privateKey).toBe("string");

      const encrypted = await encryptWithPubKeyPEM(message, keys.publicKey);
      expect(encrypted).toMatchObject({
        data: expect.any(String),
        encoding: "base64",
      });

      const decrypted = await decryptWithPrivateKeyPEM(
        encrypted,
        keys.privateKey
      );
      expect(typeof decrypted).toBe("string");
    });
  });

  describe("Platform compatibility", () => {
    it("should work with Web Crypto API", () => {
      // Check that crypto.subtle is available
      expect(crypto).toBeDefined();
      expect(crypto.subtle).toBeDefined();
      expect(typeof crypto.subtle.generateKey).toBe("function");
      expect(typeof crypto.subtle.encrypt).toBe("function");
      expect(typeof crypto.subtle.decrypt).toBe("function");
    });
  });
});
