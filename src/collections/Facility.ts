import mongoose, { Schema, model, models } from 'mongoose';

export type IFacility = {
    _id?: string;
    id: string; // The manual ID like "52-205"
    name: { th: string; en: string };
    image: string;
    description: { th: string; en: string };
    gallery: string[];
    capacity: { th: string; en: string };
    equipment: string[];
    building?: string; // Derived from ID usually, but good to have explicit or virtual
    createdAt?: Date;
    updatedAt?: Date;
};

const LocalizedSchema = new Schema({
    th: { type: String, default: "" },
    en: { type: String, default: "" },
}, { _id: false });

const FacilitySchema = new Schema<IFacility>(
    {
        id: {
            type: String,
            required: [true, 'Facility ID is required'],
            unique: true,
            trim: true,
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
        description: LocalizedSchema,
        gallery: [{ type: String }],
        capacity: LocalizedSchema,
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

// In Next.js dev mode, the model might be cached with an old schema.
// We try to delete it to ensure the new schema with localized capacity is used.
if (process.env.NODE_ENV === 'development') {
    try {
        mongoose.deleteModel('Facility');
        console.log("DEBUG: Deleted Facility model for schema refresh");
    } catch (e) {
        // Model might not exist yet
    }
}

const Facility = mongoose.models.Facility || mongoose.model<IFacility>('Facility', FacilitySchema);
console.log("DEBUG: Facility model capacity path type:", Facility.schema.path('capacity').constructor.name);
export default Facility;
