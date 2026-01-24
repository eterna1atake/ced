
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Setting from '@/collections/Setting';

export const GET = async () => {
    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || user.role !== 'superuser') {
            return NextResponse.json({ error: 'Unauthorized', role: user?.role }, { status: 401 });
        }

        await dbConnect();

        // Fetch all settings and convert to object
        const settings = await Setting.find({});
        const result = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export const PUT = async (req: Request) => {
    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || user.role !== 'superuser') {
            return NextResponse.json({
                error: 'Unauthorized',
                role: user?.role,
                hasSession: !!session
            }, { status: 401 });
        }

        const data = await req.json();
        await dbConnect();

        // Update each key provided in the body
        const updates = Object.keys(data).map(key =>
            Setting.findOneAndUpdate(
                { key },
                { value: data[key] },
                { upsert: true, new: true }
            )
        );

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
