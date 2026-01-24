import mongoose, { Schema, Document } from "mongoose";

export interface IFormRequest extends Document {
    categoryId: string; // "academic" | "coop"
    sectionId: string;  // e.g., "academic-forms", "coop-docs"
    url: string;        // Cloudinary URL
    th: {
        name: string;
    };
    en: {
        name: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

const FormRequestSchema: Schema = new Schema(
    {
        categoryId: { type: String, required: true, index: true },
        sectionId: { type: String, required: true, index: true },
        url: { type: String, required: true },
        th: {
            name: { type: String, required: true },
        },
        en: {
            name: { type: String, required: true },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.FormRequest || mongoose.model<IFormRequest>("FormRequest", FormRequestSchema);

