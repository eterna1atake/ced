import { Schema, model, models } from 'mongoose';

export type IStudentService = {
    _id?: string;
    title: {
        th: string;
        en: string;
    };
    icon: string;
    link?: string;
    category: "software" | "account" | "network" | "information-system" | "service-area" | "other";
    createdAt: Date;
    updatedAt: Date;
};

const StudentServiceSchema = new Schema<IStudentService>(
    {
        title: {
            th: { type: String, required: [true, 'Thai title is required'], trim: true },
            en: { type: String, required: [true, 'English title is required'], trim: true },
        },
        icon: {
            type: String,
            default: '/images/service/default-service-icon.png',
        },
        link: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ["software", "account", "network", "information-system", "service-area", "other"],
            default: "other",
        },
    },
    {
        timestamps: true,
    }
);

const StudentService = models.StudentService || model<IStudentService>('StudentService', StudentServiceSchema);

export default StudentService;
