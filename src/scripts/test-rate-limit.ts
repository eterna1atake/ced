import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

// Dynamic import to ensure env vars are loaded before db connection init
const { incrementRateLimit } = await import("@/lib/rate-limit");

async function runTest() {
    const identifier = "test-tier-" + Date.now();
    console.log(`🚦 Starting Multi-Tier Rate Limit Test for ID: ${identifier}\n`);

    // We expect:
    // Tier 1: >5 attempts (6th) -> 60s
    // Tier 2: >6 attempts (7th) -> 120s
    // Tier 3: >7 attempts (8th) -> 180s
    // Tier 4: >8 attempts (9th) -> 240s
    // Tier 5: >9 attempts (10th) -> 300s

    for (let i = 1; i <= 10; i++) {
        const result = await incrementRateLimit(identifier);

        let status = "✅ OK";
        let expectedBlock = 0;

        if (i === 6) expectedBlock = 60;
        if (i === 7) expectedBlock = 120;
        if (i === 8) expectedBlock = 180;
        if (i === 9) expectedBlock = 240;
        if (i === 10) expectedBlock = 300;

        if (!result.success) {
            const blockedSec = Math.ceil(result.msBeforeNext / 1000);
            status = `⛔ Blocked (${blockedSec}s)`;

            // Allow small margin of error for timing
            if (expectedBlock > 0 && Math.abs(blockedSec - expectedBlock) <= 1) {
                status += ` [MATCHED Level]`;
            } else if (expectedBlock > 0) {
                status += ` [MISMATCH Expected ${expectedBlock}s]`;
            }
        }

        console.log(`Attempt ${i}: ${status}`);

        // Small delay to ensure DB ops clear
        await new Promise(r => setTimeout(r, 50));
    }

    console.log("\nDone.");
    process.exit(0);
}

runTest();
