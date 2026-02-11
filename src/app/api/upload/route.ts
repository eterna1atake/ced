import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { rateLimit } from '@/lib/security';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    const rateLimitError = await rateLimit(request);
    if (rateLimitError) return rateLimitError;

    // 1. Authentication & Role Check
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized: No active session found" },
            { status: 401 }
        );
    }

    if (user?.role !== "superuser") {
        return NextResponse.json(
            { error: "Forbidden: Superuser role required" },
            { status: 403 }
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


        const fileExtension = file.name.split('.').pop()?.toLowerCase() || "";

        // Determine resource type: 
        // - 'raw' for Office documents (Word, Excel, Zip, etc.) to bypass processing
        // - 'auto' for Images and PDFs (allows PDF viewing/preview and correct Content-Type)
        const isRawDocument =
            file.type.includes("application/msword") ||
            file.type.includes("application/vnd") || // Word, Excel
            file.type.includes("application/zip") ||
            ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "rar", "csv"].includes(fileExtension);

        const resourceType = isRawDocument ? "raw" : "auto";

        const uniqueId = crypto.randomUUID();
        let publicId = uniqueId;

        // For raw files ONLY, append extension to public_id
        // For auto (Images/PDF), Cloudinary adds extension automatically based on format
        if (isRawDocument && fileExtension) {
            publicId = `${uniqueId}.${fileExtension}`;
        }

        // 3. Upload to Cloudinary

        const uploadResponse = await new Promise((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const uploadStreamOptions: any = {
                folder: folder,
                resource_type: resourceType,
                public_id: publicId,
                type: "upload",
                access_mode: "public",
            };

            // Restore format forcing to help Cloudinary detect type correctly
            // This ensures .pdf extension is applied if it's a PDF
            if (!isRawDocument && fileExtension) {
                uploadStreamOptions.format = fileExtension;
            }

            cloudinary.uploader.upload_stream(
                uploadStreamOptions,
                (error, result) => {
                    if (error) {
                        console.error("[Upload] Cloudinary Stream Error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
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
