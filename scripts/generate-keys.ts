import { generateKeyPair } from "crypto";
import { promisify } from "util";

const generate = promisify(generateKeyPair);

async function main() {
    console.log("Generating RSA Key Pair for Secure Authentication...");

    const { publicKey, privateKey } = await generate("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "spki",
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
        },
    });

    console.log("\n=== PUBLIC KEY (Add to AUTH_PUBLIC_KEY) ===");
    console.log(publicKey);

    console.log("\n=== PRIVATE KEY (Add to AUTH_PRIVATE_KEY) ===");
    console.log(privateKey);

    console.log("\n[!] WARNING: Keep your private key secret. Do not commit it to version control.");
}

main().catch(console.error);
