import { Schema, model, models } from 'mongoose';
import { ProgramLevel } from '@/types/program';

const LocalizedStringSchema = new Schema({
    th: { type: String, default: "" },
    en: { type: String, default: "" }
}, { _id: false });

const CurriculumItemSchema: Schema = new Schema({
    id: { type: String, required: true },
    title: LocalizedStringSchema,
    credits: { type: String, default: "" },
    isBold: { type: Boolean, default: false },
    subItems: [new Schema({
        id: { type: String, required: true },
        title: LocalizedStringSchema,
        credits: { type: String, default: "" },
        isBold: { type: Boolean, default: false },
    }, { _id: false })]
}, { _id: false });

const ProgramSchema = new Schema(
    {
        id: {
            type: String,
            required: [true, 'Program ID is required'],
            unique: true,
            trim: true,
            index: true
        },
        level: {
            type: String,
            enum: ['bachelor', 'master', 'doctoral'],
            index: true
        },
        imageSrc: { type: String, default: "" },
        imageAlt: { type: String, default: "" },
        link: { type: String, default: "" },
        // General Info
        th: {
            degree: { type: String, default: "" },
            title: { type: String, default: "" },
            subtitle: { type: String, default: "" },
            description: { type: String, default: "" },
        },
        en: {
            degree: { type: String, default: "" },
            title: { type: String, default: "" },
            subtitle: { type: String, default: "" },
            description: { type: String, default: "" },
        },
        // Detailed Content
        detail: {
            name: LocalizedStringSchema,
            degree: {
                full: LocalizedStringSchema,
                short: LocalizedStringSchema,
            },
            programFormat: {
                title: LocalizedStringSchema,
                items: [{
                    title: LocalizedStringSchema,
                    subItems: [LocalizedStringSchema]
                }],
            },
            gradAttribute: {
                title: LocalizedStringSchema,
                items: [{
                    title: LocalizedStringSchema,
                    subItems: [LocalizedStringSchema]
                }],
            },
            major: {
                title: LocalizedStringSchema,
                description: LocalizedStringSchema,
            },
            highlights: {
                title: LocalizedStringSchema,
                items: [{
                    title: LocalizedStringSchema,
                    description: LocalizedStringSchema,
                }],
            },
            suitableFor: {
                title: LocalizedStringSchema,
                items: [{
                    title: LocalizedStringSchema,
                    subItems: [LocalizedStringSchema]
                }],
            },
            curriculum: [{
                title: LocalizedStringSchema,
                credits: { type: String, default: "" },
                items: [CurriculumItemSchema],
            }],
            documents: [{
                name: LocalizedStringSchema,
                url: { type: String, default: "" },
            }],
            language: LocalizedStringSchema,
            admission: LocalizedStringSchema,
            careers: {
                title: LocalizedStringSchema,
                items: [LocalizedStringSchema],
            },
        }
    },
    {
        timestamps: true,
    }
);

// Force model refresh in dev
if (process.env.NODE_ENV === 'development' && models.Program) {
    delete models.Program;
}

const Program = models.Program || model('Program', ProgramSchema);

export default Program;
