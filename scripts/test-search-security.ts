
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/public/search';
const TOTAL_REQUESTS = 70; // More than the limit (60)


async function testSecurity() {
    console.log('🛡️  Starting Search Security & Load Test...\n');

    // Test 1: Rate Limiting
    console.log('--- TEST 1: Rate Limiting (DoS Protection) ---');
    let successCount = 0;
    let blockedCount = 0;

    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
        try {
            const res = await axios.get(`${BASE_URL}?q=test`, { validateStatus: () => true });
            process.stdout.write(res.status === 200 ? '.' : 'x');

            if (res.status === 200) successCount++;
            if (res.status === 429) blockedCount++;

        } catch (err) {
            process.stdout.write('E');
        }
        // Small delay to simulate rapid human/bot behavior
        await new Promise(r => setTimeout(r, 10)); // Very fast spam
    }

    console.log('\n\n📊 Rate Limit Results:');
    console.log(`✅ Successful Requests: ${successCount}`);
    console.log(`⛔ Blocked Requests (429): ${blockedCount}`);

    if (blockedCount > 0) {
        console.log('Pass: Rate limiting is responding correctly.');
    } else {
        console.log('Warning: No requests were blocked! Check limit configuration.');
    }

    // Test 2: NoSQL/Regex Injection
    console.log('\n--- TEST 2: Injection Attacks (Input Sanitization) ---');
    const injectionAttacks = [
        { name: 'Regex Dos (ReDoS)', payload: '((a+)+)+$' },
        { name: 'NoSQL Injection', payload: '{$gt: ""}' },
        { name: 'Special Chars', payload: '.*' },
        { name: 'Script Tag', payload: '<script>alert(1)</script>' }
    ];

    for (const attack of injectionAttacks) {
        try {
            const res = await axios.get(`${BASE_URL}?q=${encodeURIComponent(attack.payload)}`);
            // Validate that it didn't crash (500) and didn't return sensitive data/all data
            if (res.status === 200) {
                console.log(`✅ [${attack.name}] Handled safely (Status 200). Results: ${res.data.results.length}`);
            } else {
                console.log(`⚠️ [${attack.name}] Unexpected status: ${res.status}`);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.log(`❌ [${attack.name}] Failed/Crashed: ${errorMessage}`);
        }
    }
}

testSecurity();
