
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Personnel from "@/collections/Personnel";

// Ensure dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Extract id from params
        await dbConnect();

        let query;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // If valid ObjectId, try both ID and Slug (just in case)
            query = { $or: [{ _id: id }, { slug: id }] };
        } else {
            // Otherwise assume it's a slug
            query = { slug: id };
        }

        const person = await Personnel.findOne(query);

        if (!person) {
            return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
        }
        return NextResponse.json(person);
    } catch (error) {
        console.error("Error fetching personnel detail:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
