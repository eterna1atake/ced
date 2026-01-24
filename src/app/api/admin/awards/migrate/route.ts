import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Award from "@/collections/Award";
import { awards } from "@/data/awardsData";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();

        // 1. Check if awards already exist to avoid double seeding
        const count = await Award.countDocuments();
        if (count > 0) {
            return NextResponse.json({ message: "Database already has data. Migration skipped to prevent duplicates.", count });
        }

        // 2. Prepare data (strip static string IDs)
        const awardsToSeed = awards.map(({ id, ...rest }) => ({
            ...rest,
            gallery: rest.gallery || []
        }));

        // 3. Insert into MongoDB
        const result = await Award.insertMany(awardsToSeed);

        return NextResponse.json({
            message: "Migration successful",
            insertedCount: result.length
        });

    } catch (error: any) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
