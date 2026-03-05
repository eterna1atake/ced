import { Schema, model, models } from 'mongoose';

export type IFacility = {
    _id?: string;
    id: string; // The manual ID like "52-205"
    name: { th: string; en: string };
    image: string;
    description: { th: string; en: string };
    gallery: string[];
    capacity: string;
    equipment: string[];
    building?: string; // Derived from ID usually, but good to have explicit or virtual
    createdAt?: Date;
    updatedAt?: Date;
};

const FacilitySchema = new Schema<IFacility>(
    {
        id: {
            type: String,
            required: [true, 'Facility ID is required'],
            unique: true,
            trim: true,
            // 44-xxx or 52-xxx
            validate: {
                validator: function (v: string) {
                    return /^(44|52)-/.test(v);
                },
                message: props => `${props.value} is not a valid facility ID. Must start with 44- or 52-.`
            }
        },
        name: {
            th: { type: String, required: [true, 'Thai name is required'], trim: true },
            en: { type: String, required: [true, 'English name is required'], trim: true },
        },
        image: {
            type: String,
            required: [true, 'Cover image is required'],
            trim: true,
        },
        description: {
            th: { type: String, default: "" },
            en: { type: String, default: "" },
        },
        gallery: [{ type: String }],
        capacity: { type: String, default: "" },
        equipment: [{ type: String }],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for building number
FacilitySchema.virtual('building').get(function () {
    if (this.id && typeof this.id === 'string') {
        const parts = this.id.split('-');
        return parts[0] || 'Unknown';
    }
    return 'Unknown';
});

const Facility = models.Facility || model<IFacility>('Facility', FacilitySchema);

export default Facility;
