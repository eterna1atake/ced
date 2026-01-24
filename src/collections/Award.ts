import { Schema, model, models } from 'mongoose';

export type IAwardItem = {
    _id?: string;
    title: { th: string; en: string };
    project: { th: string; en: string };
    team: { th: string; en: string }[];
    advisors: { th: string; en: string }[];
    image: string;
    gallery: string[];
    year: string;
    date?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

const AwardSchema = new Schema<IAwardItem>(
    {
        title: {
            th: { type: String, required: [true, 'Thai title is required'], trim: true },
            en: { type: String, required: [true, 'English title is required'], trim: true },
        },
        project: {
            th: { type: String, required: [true, 'Thai project is required'], trim: true },
            en: { type: String, required: [true, 'English project is required'], trim: true },
        },
        team: [{
            th: { type: String, required: true },
            en: { type: String, required: true },
        }],
        advisors: [{
            th: { type: String, required: true },
            en: { type: String, required: true },
        }],
        image: {
            type: String,
            required: [true, 'Main image is required'],
        },
        gallery: {
            type: [String],
            default: [],
        },
        year: {
            type: String,
            required: [true, 'Year is required'],
            index: true
        },
        date: {
            type: String,
            default: "",
        }
    },
    {
        timestamps: true,
    }
);

const Award = models.Award || model<IAwardItem>('Award', AwardSchema);

export default Award;
