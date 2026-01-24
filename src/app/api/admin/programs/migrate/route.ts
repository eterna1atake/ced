import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Program from "@/collections/Program";
import { PROGRAMS_SEED } from "@/data/programs";
import { PROGRAM_DETAILS } from "@/data/program-details";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();

        const results = [];
        for (const seed of PROGRAMS_SEED) {
            const detail = PROGRAM_DETAILS[seed.id];
            const data = {
                ...seed,
                detail: detail || {}
            };

            const updated = await Program.findOneAndUpdate(
                { id: seed.id },
                { $set: data },
                { upsert: true, new: true }
            );
            results.push(updated.id);
        }

        return NextResponse.json({ message: "Migration successful", programs: results });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: "Migration failed" }, { status: 500 });
    }
}
