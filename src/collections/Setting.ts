
import { Schema, model, models, Document } from 'mongoose';

export interface ISetting extends Document {
    key: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        value: {
            type: Schema.Types.Mixed,
            required: true
        },
    },
    {
        timestamps: true,
    }
);

const Setting = models.Setting || model<ISetting>('Setting', SettingSchema);

export default Setting;
