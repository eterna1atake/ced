
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Setting from '@/collections/Setting';

export const dynamic = 'force-dynamic'; // [New] Ensure this is not cached
export const revalidate = 0;

export const GET = async () => {
    try {
        await dbConnect();

        // Fetch all relevant settings at once
        const settings = await Setting.find({
            key: { $in: ['theme', 'theme_start_date', 'theme_end_date', 'theme_force_disable_snow'] }
        });

        const getVal = (key: string) => settings.find(s => s.key === key)?.value;

        let theme = getVal('theme') || 'default';
        const startDate = getVal('theme_start_date');
        const endDate = getVal('theme_end_date');
        const forceDisableSnow = getVal('theme_force_disable_snow') === 'true' || getVal('theme_force_disable_snow') === true;

        // Date Check Logic
        if (theme !== 'default' && (startDate || endDate)) {
            const now = new Date();
            const start = startDate ? new Date(startDate as string) : null;
            const end = endDate ? new Date(endDate as string) : null;

            if (start && now < start) {
                theme = 'default';
            }
            if (end) {
                // Set end date to end of day
                end.setHours(23, 59, 59, 999);
                if (now > end) {
                    theme = 'default';
                }
            }
        }

        return NextResponse.json({
            theme,
            snowEnabled: !forceDisableSnow
        });
    } catch (error) {
        console.error('Error fetching public settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
