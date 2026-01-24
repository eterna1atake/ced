import { Schema, model, models } from 'mongoose';

export type IOnlineResource = {
    _id?: string;
    key: string;
    link: string;
    iconName: string;
    imagePath?: string;
    colorClass: string;
    categoryKey: "learning_resources" | "systems_tools";
    th: {
        title: string;
        description: string;
    };
    en: {
        title: string;
        description: string;
    };
    createdAt: Date;
    updatedAt: Date;
};

const OnlineResourceSchema = new Schema<IOnlineResource>(
    {
        key: { type: String, required: true, unique: true, trim: true },
        link: { type: String, required: true, trim: true },
        iconName: { type: String, required: true },
        imagePath: { type: String, trim: true },
        colorClass: { type: String, default: "bg-white" },
        categoryKey: {
            type: String,
            enum: ["learning_resources", "systems_tools"],
            required: true
        },
        th: {
            title: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true },
        },
        en: {
            title: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true },
        },
    },
    {
        timestamps: true,
    }
);

const OnlineResource = models.OnlineResource || model<IOnlineResource>('OnlineResource', OnlineResourceSchema);

export default OnlineResource;
