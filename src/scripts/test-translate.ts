import translate from "google-translate-api-next";

async function test() {
    try {
        console.log("Testing translation...");
        const res = await translate("สวัสดี", { from: "th", to: "en" });
        console.log("Full Result:", JSON.stringify(res, null, 2));
    } catch (error) {
        console.error("Error during test:", error);
    }
}

test();
