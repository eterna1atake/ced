import { Schema, model, models } from 'mongoose';

export type INewsItem = {
    _id?: string;
    slug: string;
    title: { th: string; en: string };
    summary: { th: string; en: string };
    content: { th: string; en: string };
    imageSrc: string;
    imageAlt?: string;
    galleryImages: string[];
    category: string;
    date: Date;
    author: { th: string; en: string };
    status: 'published' | 'draft' | 'archived';
    tags: string[];
    createdAt?: Date;
    updatedAt?: Date;
};

const NewsSchema = new Schema<INewsItem>(
    {
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            trim: true,
            index: true
        },
        title: {
            th: { type: String, required: [true, 'Thai title is required'], trim: true },
            en: { type: String, required: [true, 'English title is required'], trim: true },
        },
        summary: {
            th: { type: String, default: "" },
            en: { type: String, default: "" },
        },
        content: {
            th: { type: String, default: "" },
            en: { type: String, default: "" },
        },
        imageSrc: {
            type: String,
            default: "",
        },
        imageAlt: {
            type: String,
            default: "",
        },
        galleryImages: {
            type: [String],
            default: [],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            index: true
        },
        date: {
            type: Date,
            default: Date.now,
        },
        author: {
            th: { type: String, default: "" },
            en: { type: String, default: "" },
        },
        status: {
            type: String,
            enum: ['published', 'draft', 'archived'],
            default: 'draft',
            index: true
        },
        tags: {
            type: [String],
            default: [],
            index: true
        }
    },
    {
        timestamps: true,
    }
);

const News = models.News || model<INewsItem>('News', NewsSchema);

export default News;
