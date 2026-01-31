import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface TrafficData {
    time: string;
    "Visitors": number;
    "Page Views": number;
}

export async function getRealtimeTraffic(): Promise<TrafficData[]> {
    const PROPERTY_ID = process.env.GA_PROPERTY_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!PROPERTY_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
        console.warn("GA4 Credentials missing. Using mock data.");
        // Debug info
        // console.log("Debug Env:", { 
        //     hasPropertyId: !!PROPERTY_ID, 
        //     hasEmail: !!CLIENT_EMAIL, 
        //     hasKey: !!PRIVATE_KEY 
        // });
        return [];
    }

    try {
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: CLIENT_EMAIL,
                private_key: PRIVATE_KEY,
            },
        });

        // Fetch last 7 days metrics
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${PROPERTY_ID}`,
            dateRanges: [
                {
                    startDate: '7daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                { name: 'date' },
            ],
            metrics: [
                { name: 'activeUsers' },
                { name: 'screenPageViews' },
            ],
            orderBys: [
                { dimension: { dimensionName: 'date' } }
            ]
        });

        // Transform GA4 response to our Dashboard format
        const trafficData: TrafficData[] = [];

        response.rows?.forEach(row => {
            if (row.dimensionValues && row.metricValues) {
                const dateStr = row.dimensionValues[0].value; // YYYYMMDD
                // Format date to short readable string e.g., "Jan 01"
                const formattedDate = dateStr
                    ? new Date(
                        parseInt(dateStr.substring(0, 4)),
                        parseInt(dateStr.substring(4, 6)) - 1,
                        parseInt(dateStr.substring(6, 8))
                    ).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                    : "Unknown";

                trafficData.push({
                    time: formattedDate,
                    "Visitors": parseInt(row.metricValues[0].value || "0"),
                    "Page Views": parseInt(row.metricValues[1].value || "0"),
                });
            }
        });

        return trafficData;

    } catch (error) {
        console.error("Failed to fetch GA4 data:", error);
        return [];
    }
}

export interface EngagementData {
    topic: string;
    "Views": number;
}

export async function getPageEngagement(): Promise<EngagementData[]> {
    const PROPERTY_ID = process.env.GA_PROPERTY_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!PROPERTY_ID || !CLIENT_EMAIL || !PRIVATE_KEY) return [];

    try {
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: CLIENT_EMAIL,
                private_key: PRIVATE_KEY,
            },
        });

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${PROPERTY_ID}`,
            dateRanges: [
                {
                    startDate: '30daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                { name: 'pagePath' }, // Use pagePath to categorize
            ],
            metrics: [
                { name: 'screenPageViews' },
            ],
        });

        // Initialize counters
        let newsViews = 0;
        let programsViews = 0;
        let personnelViews = 0;
        let generalViews = 0;

        response.rows?.forEach(row => {
            const path = row.dimensionValues?.[0]?.value || "";
            const views = parseInt(row.metricValues?.[0]?.value || "0");

            if (path.includes("/news")) {
                newsViews += views;
            } else if (path.includes("/programs")) {
                programsViews += views;
            } else if (path.includes("/personnel")) {
                personnelViews += views;
            } else {
                generalViews += views;
            }
        });

        return [
            { topic: "News & Events", "Views": newsViews },
            { topic: "Academic Programs", "Views": programsViews },
            { topic: "Personnel", "Views": personnelViews },
            { topic: "General Pages", "Views": generalViews },
        ].sort((a, b) => b.Views - a.Views);

    } catch (error) {
        console.error("Failed to fetch GA4 engagement:", error);
        return [];
    }
}
