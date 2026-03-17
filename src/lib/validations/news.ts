import { z } from "zod";

export const LocalizedStringSchema = z.object({
    th: z.string().default(""),
    en: z.string().default(""),
});

export const NewsSchema = z.object({
    slug: z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    title: z.object({
        th: z.string().trim().min(1, "Thai title is required"),
        en: z.string().trim().min(1, "English title is required"),
    }),
    content: LocalizedStringSchema,
    imageSrc: z.string().optional().default(""),
    imageAlt: z.string().optional().default(""),
    galleryImages: z.array(z.string()).optional().default([]),
    category: z.string().trim().min(1, "Category is required"),
    date: z.string().or(z.date()).transform((val) => new Date(val)),
    author: LocalizedStringSchema,
    status: z.enum(['published', 'draft', 'archived']).default('draft'),
    tags: z.array(z.string()).optional().default([]),
    isPinned: z.boolean().optional().default(false),
    pinnedAt: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
});

export type INewsInput = z.infer<typeof NewsSchema>;
