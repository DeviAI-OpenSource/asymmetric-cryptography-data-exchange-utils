import {
  createKeys,
  createKeysPEM,
  encryptWithPubKey,
  encryptWithPubKeyPEM,
  decryptWithPrivateKey,
  decryptWithPrivateKeyPEM,
} from "../src/index";

// Example usage of the universal asymmetric cryptography library
async function main() {
  console.log(
    "🔐 Universal Asymmetric Cryptography Data Exchange Utils Example\n"
  );
  console.log(
    "✨ Compatible with Node.js, Browsers, Cloudflare Workers, Deno, and Bun!\n"
  );

  try {
    // Step 1: Create key pairs (both CryptoKey and PEM formats)
    console.log("1. Creating RSA key pairs...");
    const [cryptoKeyPair, pemKeyPair] = await Promise.all([
      createKeys(2048),
      createKeysPEM(2048),
    ]);
    console.log("✅ Key pairs created successfully");
    console.log(
      `   - CryptoKey format: ${cryptoKeyPair.publicKey.type} key (${cryptoKeyPair.publicKey.algorithm.name})`
    );
    console.log(
      `   - PEM format: ${pemKeyPair.publicKey.split("\n").length} lines\n`
    );

    // Step 2: Test CryptoKey encryption/decryption
    console.log(
      "2. Testing CryptoKey API: Public Key Encryption → Private Key Decryption"
    );
    const message1 = "Hello, this is a secret message using CryptoKey API!";
    console.log(`Original message: "${message1}"`);

    const encrypted1 = await encryptWithPubKey(
      message1,
      cryptoKeyPair.publicKey
    );
    console.log(`Encrypted: ArrayBuffer(${encrypted1.data.byteLength} bytes)`);

    const decrypted1 = await decryptWithPrivateKey(
      encrypted1,
      cryptoKeyPair.privateKey
    );
    console.log(`Decrypted: "${decrypted1}"`);
    console.log(`✅ Match: ${message1 === decrypted1 ? "YES" : "NO"}\n`);

    // Step 3: Test PEM encryption/decryption
    console.log(
      "3. Testing PEM API: Public Key Encryption → Private Key Decryption"
    );
    const message2 = "Hello, this is a secret message using PEM API!";
    console.log(`Original message: "${message2}"`);

    const encrypted2 = await encryptWithPubKeyPEM(
      message2,
      pemKeyPair.publicKey
    );
    console.log(
      `Encrypted: ${encrypted2.data.substring(0, 50)}... (${
        encrypted2.encoding
      })`
    );

    const decrypted2 = await decryptWithPrivateKeyPEM(
      encrypted2,
      pemKeyPair.privateKey
    );
    console.log(`Decrypted: "${decrypted2}"`);
    console.log(`✅ Match: ${message2 === decrypted2 ? "YES" : "NO"}\n`);

    // Step 4: Demonstrate cross-platform compatibility
    console.log("4. Platform Compatibility Check");
    console.log(
      `✅ Web Crypto API available: ${
        typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined"
      }`
    );
    console.log(
      `✅ Running on: ${
        typeof window !== "undefined"
          ? "Browser"
          : typeof global !== "undefined"
          ? "Node.js"
          : typeof self !== "undefined"
          ? "Web Worker/Service Worker"
          : "Unknown"
      }`
    );
    console.log();

    // Step 5: Performance comparison
    console.log("5. Performance Test");
    const startTime = performance.now();

    // Generate multiple key pairs
    const testKeyPairs = await Promise.all([
      createKeys(2048),
      createKeys(2048),
      createKeys(2048),
    ]);

    // Encrypt and decrypt with each pair
    const testMessage = "Performance test message";
    for (let i = 0; i < testKeyPairs.length; i++) {
      const encrypted = await encryptWithPubKey(
        testMessage,
        testKeyPairs[i].publicKey
      );
      const decrypted = await decryptWithPrivateKey(
        encrypted,
        testKeyPairs[i].privateKey
      );
      if (decrypted !== testMessage) {
        throw new Error(`Performance test failed at iteration ${i}`);
      }
    }

    const endTime = performance.now();
    console.log(
      `✅ Created 3 key pairs and performed 3 encrypt/decrypt cycles in ${(
        endTime - startTime
      ).toFixed(2)}ms`
    );
    console.log();

    console.log("🎉 All cryptographic operations completed successfully!");
    console.log(
      "🌍 Your library is now universally compatible across all modern JavaScript runtimes!"
    );
  } catch (error) {
    console.error("❌ Error during cryptographic operations:", error);
    process.exit(1);
  }
}

// Run the example
if (typeof require !== "undefined" && require.main === module) {
  main().catch(console.error);
} else {
  // For browser/worker environments
  main().catch(console.error);
}
