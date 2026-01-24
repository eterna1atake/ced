import { Schema, model, models } from 'mongoose';

export type IEducationEntry = {
    level: { th: string; en: string };
    major: { th: string; en: string };
    university: { th: string; en: string };
};

export type ICustomLink = {
    title: string;
    url: string;
};

export type IPersonnel = {
    _id?: string;
    name: { th: string; en: string };
    position: { th: string; en: string };
    email: string;
    imageSrc: string;
    education: IEducationEntry[];
    courses: { courseId?: string; th: string; en: string }[];
    room?: string;
    phone?: string;
    scopusLink?: string;
    researchProfileLink?: string;
    googleScholarLink?: string;
    slug?: string;
    customLinks?: ICustomLink[];
    createdAt?: Date;
    updatedAt?: Date;
};

const EducationSchema = new Schema({
    level: {
        th: { type: String, default: "" },
        en: { type: String, default: "" }
    },
    major: {
        th: { type: String, default: "" },
        en: { type: String, default: "" }
    },
    university: {
        th: { type: String, default: "" },
        en: { type: String, default: "" }
    }
}, { _id: false });

const CourseSchema = new Schema({
    courseId: { type: String, default: "" },
    th: { type: String, default: "" },
    en: { type: String, default: "" }
}, { _id: false });

const CustomLinkSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });

const PersonnelSchema = new Schema<IPersonnel>(
    {
        name: {
            th: { type: String, required: [true, 'Thai name is required'], trim: true },
            en: { type: String, required: [true, 'English name is required'], trim: true },
        },
        position: {
            th: { type: String, required: [true, 'Thai position is required'], trim: true },
            en: { type: String, required: [true, 'English position is required'], trim: true },
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            unique: true, // Assuming email should be unique
        },
        imageSrc: {
            type: String,
            default: "",
        },
        education: [EducationSchema],
        courses: [CourseSchema],
        room: { type: String, trim: true },
        phone: { type: String, trim: true },
        scopusLink: { type: String, trim: true },
        researchProfileLink: { type: String, trim: true },
        googleScholarLink: { type: String, trim: true },
        slug: { type: String, unique: true, sparse: true, trim: true },
        customLinks: [CustomLinkSchema],
    },
    {
        timestamps: true,
    }
);

// Force model refresh in dev to ensure schema updates (like slug) are applied
if (process.env.NODE_ENV === 'development' && models.Personnel) {
    delete models.Personnel;
}

const Personnel = models.Personnel || model<IPersonnel>('Personnel', PersonnelSchema);

export default Personnel;
