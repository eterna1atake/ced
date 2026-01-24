import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    // 1. Authentication & Role Check
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    if (!session || user?.role !== "superuser") {
        return NextResponse.json(
            { error: "Unauthorized. Admin access required." },
            { status: 401 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = (formData.get("folder") as string) || "ced_web/other";

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // 2. Security Checks (File Type & Size)
        const ALLOWED_TYPES = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];
        const MAX_SIZE = 10 * 1024 * 1024; // Increased to 10MB for documents

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only Images, PDF, Word, and Excel are allowed." },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File size too large. Max 10MB for documents." },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine resource type: 'raw' for documents to bypass PDF delivery restrictions
        const isDocument = file.type.includes("pdf") ||
            file.type.includes("application/") ||
            file.type.includes("text/");
        const resourceType = isDocument ? "raw" : "auto";

        // Generate a safe random filename with original extension to ensure proper download behavior
        const fileExtension = file.name.split('.').pop() || "";
        const safeFilename = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension ? "." + fileExtension : ""}`;

        // 3. Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: resourceType,
                    public_id: safeFilename, // Set explicit public_id with extension
                    type: "upload",
                    access_mode: "public",
                    use_filename: false,
                    unique_filename: false
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = uploadResponse as any;

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
        });

    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error("Cloudinary upload error:", err);
        return NextResponse.json(
            { error: `Upload failed: ${err.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
