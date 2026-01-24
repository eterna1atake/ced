import { Schema, model, models } from 'mongoose';

export type IHeroCarousel = {
    _id?: string;
    src: string;
    alt: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const HeroCarouselSchema = new Schema<IHeroCarousel>(
    {
        src: {
            type: String,
            required: [true, 'Image URL is required'],
        },
        alt: {
            type: Schema.Types.Mixed, // Support String (legacy) or LocalizedString
            default: '',
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Add index for the main query used in layout
HeroCarouselSchema.index({ isActive: 1, order: 1, createdAt: -1 });

const HeroCarousel = models.HeroCarousel || model<IHeroCarousel>('HeroCarousel', HeroCarouselSchema);

export default HeroCarousel;
