
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import News from '@/collections/News';
import Personnel from '@/collections/Personnel';
import Award from '@/collections/Award';
import StudentService from '@/collections/StudentService';
import { getClientIp } from '@/lib/ip';
import { checkSearchLimit, incrementSearchLimit } from '@/lib/rate-limit';

// Force dynamic to ensure we get fresh results and IP info
export const dynamic = 'force-dynamic';

function escapeRegex(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Interface definitions
interface SearchResultItem {
    type: 'news' | 'personnel' | 'page' | 'award' | 'service' | 'research';
    title: string;
    subtitle?: string;
    url: string;
    image?: string;
    meta?: string;
    icon?: string;
    score?: number;
    rawTitle?: string;
    rawSubtitle?: string;
    rawKeywords?: string[];
    rawSummary?: string;
    rawDate?: Date | string;
}



// Basic interfaces for DB results
interface NewsDoc {
    title: { th: string; en: string };
    slug: string;
    category: string;
    date: string | Date;
    imageSrc: string;
    summary: { th: string; en: string };
    status?: string;
}

interface PersonnelDoc {
    name: { th: string; en: string };
    position: { th: string; en: string };
    slug: string;
    imageSrc: string;
    email: string;
}

interface AwardDoc {
    _id: string;
    title: { th: string; en: string };
    project: { th: string; en: string };
    team: { th: string; en: string }[];
    year: string;
    image: string;
}

interface StudentServiceDoc {
    title: { th: string; en: string };
    link: string;
    category: string;
}
const SYNONYMS: Record<string, string[]> = {
    'teacher': ['lecturer', 'professor', 'instructor', 'faculty', 'อาจารย์', 'ครู', 'ผู้สอน'],
    'อาจารย์': ['lecturer', 'professor', 'instructor', 'faculty', 'teacher', 'ครู'],
    'staff': ['personnel', 'officer', 'employee', 'เจ้าหน้าที่', 'บุคลากร', 'team'],
    'บุคลากร': ['staff', 'personnel', 'officer', 'team'],
    'student': ['pupil', 'buyer', 'learner', 'นักศึกษา', 'นิสิต'],
    'นักศึกษา': ['student', 'pupil'],
    'news': ['update', 'announcement', 'activity', 'event', 'ข่าว', 'ประชาสัมพันธ์', 'กิจกรรม'],
    'ข่าว': ['news', 'update', 'announcement'],
    'contact': ['address', 'call', 'email', 'location', 'map', 'ติดต่อ', 'ที่อยู่', 'แผนที่'],
    'ติดต่อ': ['contact', 'address', 'call'],
    'register': ['apply', 'admission', 'enroll', 'สมัคร', 'ลงทะเบียน'],
    'สมัคร': ['register', 'apply', 'admission'],
    'award': ['prize', 'competition', 'winner', 'medal', 'รางวัล', 'ชนะเลิศ', 'เหรียญ'],
    'รางวัล': ['award', 'prize', 'competition', 'winner'],
    'download': ['form', 'document', 'pdf', 'file', 'ดาวน์โหลด', 'เอกสาร', 'แบบฟอร์ม'],
    'ดาวน์โหลด': ['download', 'form', 'document']
};

function expandQuery(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const expanded = new Set(words);

    words.forEach(word => {
        // Check for synonyms
        for (const key in SYNONYMS) {
            if (key === word || SYNONYMS[key].includes(word)) {
                expanded.add(key);
                SYNONYMS[key].forEach(syn => expanded.add(syn));
            }
        }
    });

    return Array.from(expanded);
}

function createSmartRegex(text: string): RegExp {
    // 1. Split into terms
    const terms = text.trim().split(/\s+/).filter(t => t.length > 0);

    if (terms.length === 0) return new RegExp('.*');

    // 2. Escape special chars
    const escapedTerms = terms.map(t => escapeRegex(t));

    // 3. Create Lookahead Regex: (?=.*term1)(?=.*term2) -> matches string containing both (any order)
    const pattern = escapedTerms.map(term => `(?=.* ${term})`).join('');
    return new RegExp(pattern, 'i');
}

const STATIC_PAGES = [
    { title: { th: 'หน้าแรก', en: 'Home' }, url: '', keywords: ['home', 'index', 'main', 'หน้าแรก', 'หลัก', 'เริ่มต้น', 'welcome'] },
    { title: { th: 'เกี่ยวกับภาควิชา', en: 'About Department' }, url: '/about', keywords: ['about', 'history', 'vision', 'mission', 'เกี่ยวกับ', 'ประวัติ', 'วิสัยทัศน์', 'พันธกิจ', 'ความเป็นมา'] },
    { title: { th: 'บุคลากร', en: 'Personnel' }, url: '/personnel', keywords: ['personnel', 'staff', 'teacher', 'faculty', 'บุคลากร', 'อาจารย์', 'เจ้าหน้าที่', 'ทีมงาน', 'structure'] },
    { title: { th: 'หลักสูตร', en: 'Programs' }, url: '/programs', keywords: ['program', 'curriculum', 'course', 'degree', 'bachelor', 'master', 'phd', 'หลักสูตร', 'การเรียน', 'วิชา', 'ปริญญา', 'ตรี', 'โท', 'เอก'] },
    { title: { th: 'ข่าวสารและกิจกรรม', en: 'News & Events' }, url: '/newsandevents', keywords: ['news', 'event', 'activity', 'announcement', 'pr', 'ข่าว', 'กิจกรรม', 'ประกาศ', 'ประชาสัมพันธ์', 'ทุน'] },
    { title: { th: 'ติดต่อเรา', en: 'Contact Us' }, url: '/contact-us', keywords: ['contact', 'map', 'location', 'email', 'phone', 'tel', 'fax', 'ติดต่อ', 'แผนที่', 'เบอร์โทร', 'ที่อยู่', 'เดินทาง'] },
    { title: { th: 'บริการนักศึกษา', en: 'Student Services' }, url: '/student-services', keywords: ['service', 'student', 'download', 'form', 'request', 'document', 'บริการ', 'นักศึกษา', 'ดาวน์โหลด', 'แบบฟอร์ม', 'คำร้อง'] },
    { title: { th: 'แอดมิชชั่น / รับสมัคร', en: 'Admissions' }, url: 'https://admission.kmutnb.ac.th/', keywords: ['admission', 'apply', 'register', 'entrance', 'รับสมัคร', 'สอบเข้า', 'สมัครเรียน', 'tcas'] },
    { title: { th: 'ผลงานและรางวัล', en: 'Awards & Achievements' }, url: '/awards', keywords: ['award', 'prize', 'competition', 'winner', 'achievement', 'รางวัล', 'ผลงาน', 'ชนะเลิศ', 'แข่งขัน'] },
    { title: { th: 'งานวิจัยและนวัตกรรม', en: 'Research & Innovation' }, url: 'https://research.kmutnb.ac.th', keywords: ['research', 'innovation', 'paper', 'publication', 'scopus', 'วิจัย', 'นวัตกรรม', 'ตีพิมพ์', 'บทความ'] },
    { title: { th: 'ระบบจองห้องเรียน', en: 'Classroom Scheduler' }, url: '/classroom', keywords: ['classroom', 'room', 'booking', 'schedule', 'ห้องเรียน', 'จองห้อง', 'ตารางเรียน'] },
    { title: { th: 'แหล่งเรียนรู้ออนไลน์', en: 'Online Learning Resources' }, url: '/online-learning-resources', keywords: ['online', 'learning', 'resource', 'lms', 'moodle', 'tool', 'software', 'เรียนรู้', 'ออนไลน์', 'สื่อการสอน'] },
    { title: { th: 'ยื่นคำร้อง', en: 'Form Requests' }, url: '/form-requests', keywords: ['form', 'request', 'document', 'petition', 'ยื่นคำร้อง', 'แบบฟอร์ม', 'คำร้อง', 'เอกสาร'] },
];

export async function GET(req: NextRequest) {
    try {
        const ip = await getClientIp();

        // 1. Rate Limiting
        const limitCheck = await checkSearchLimit(ip);
        if (!limitCheck.success) {
            return NextResponse.json(
                { error: 'Too many requests', retryAfter: Math.ceil(limitCheck.msBeforeNext / 1000) },
                { status: 429 }
            );
        }
        await incrementSearchLimit(ip);

        // 2. Parse Query
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q')?.trim();
        const locale = searchParams.get('locale') || 'th';

        if (!q || q.length < 2) {
            return NextResponse.json({ results: [] });
        }

        // 3. Connect DB
        await dbConnect();

        // 4. Generate Search Strategies
        const smartRegex = createSmartRegex(q);

        // 5. Parallel Search (+ Award, + StudentService)
        const CANDIDATE_LIMIT = 20;

        const [newsResults, personnelResults, awardResults, serviceResults] = await Promise.all([
            // Search News
            News.find({
                status: 'published',
                $or: [
                    { [`title.${locale} `]: smartRegex },
                    { [`title.en`]: smartRegex },
                    { [`summary.${locale} `]: smartRegex },
                    { tags: smartRegex }
                ]
            })
                .select('title slug category date imageSrc summary')
                .sort({ date: -1 })
                .limit(CANDIDATE_LIMIT)
                .lean(),

            // Search Personnel
            Personnel.find({
                $or: [
                    { [`name.${locale} `]: smartRegex },
                    { [`name.en`]: smartRegex },
                    { [`position.${locale} `]: smartRegex },
                    { [`position.en`]: smartRegex },
                    { email: smartRegex }
                ]
            })
                .select('name position slug imageSrc email')
                .limit(CANDIDATE_LIMIT)
                .lean(),

            // Search Awards
            Award.find({
                $or: [
                    { [`title.${locale} `]: smartRegex },
                    { [`title.en`]: smartRegex },
                    { [`project.${locale} `]: smartRegex },
                    { [`team.th`]: smartRegex }, // Team is array of strings/objects, simplifying for now
                ]
            })
                .select('title project year image')
                .sort({ year: -1 })
                .limit(CANDIDATE_LIMIT)
                .lean(),

            // Search Student Services (Downloads)
            StudentService.find({
                $or: [
                    { [`title.${locale} `]: smartRegex },
                    { [`title.en`]: smartRegex },
                ]
            })
                .select('title link category')
                .limit(CANDIDATE_LIMIT)
                .lean()
        ]);

        // 6. Search Static Pages
        const expandedTerms = expandQuery(q);
        const expandedRegex = new RegExp(expandedTerms.map(escapeRegex).join('|'), 'i');

        const pageResults = STATIC_PAGES.filter(page => {
            const titleMatch = page.title.th?.match(expandedRegex) || page.title.en?.match(expandedRegex);
            const keywordMatch = page.keywords.some(k => k.match(expandedRegex));
            return titleMatch || keywordMatch;
        }).map(page => ({
            title: page.title,
            url: page.url,
            type: 'page',
            icon: page.url.startsWith('http') ? 'external-link' : 'link',
            keywords: page.keywords
        }));

        // 7. Standardize Items for Scoring
        const allItems: SearchResultItem[] = [
            ...pageResults.map(item => ({
                type: 'page' as const,
                title: (item.title[locale as 'th' | 'en'] || item.title['en']) as string,
                subtitle: '',
                url: item.url,
                icon: item.icon,
                // keywords: item.keywords, // Not directly part of SearchResultItem, but rawKeywords is
                rawTitle: (item.title[locale as 'th' | 'en'] || item.title['en']) as string,
                rawSubtitle: '',
                rawKeywords: item.keywords || []
            })),
            ...newsResults.map((item: NewsDoc) => ({
                type: 'news' as const,
                title: (item.title[locale as 'th' | 'en'] || item.title['en']) as string,
                subtitle: new Date(item.date).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                url: `/news/${item.slug}`,
                image: item.imageSrc,
                meta: item.category,
                // Scoring props
                rawTitle: (item.title[locale as 'th' | 'en'] || item.title['en']) as string,
                rawSummary: item.summary?.[locale as 'th' | 'en'] || '',
                rawDate: item.date
            })),
            ...personnelResults.map((item: PersonnelDoc) => ({
                type: 'personnel' as const,
                title: (item.name[locale as 'th' | 'en'] || item.name['en']) as string,
                subtitle: (item.position[locale as 'th' | 'en'] || item.position['en']) as string,
                url: `/personnel${item.slug ? `/${item.slug}` : ''}`,
                image: item.imageSrc,
                // Scoring props
                rawTitle: (item.name[locale as 'th' | 'en'] || item.name['en']) as string,
                rawSubtitle: (item.position[locale as 'th' | 'en'] || item.position['en']) as string
            })),
            ...awardResults.map((item: AwardDoc) => ({
                type: 'award' as const,
                title: (item.title[locale as 'th' | 'en'] || item.title['en']) as string,
                subtitle: (item.project[locale as 'th' | 'en'] || item.project['en']) as string,
                url: `/about/awards/${item._id}`,
                image: item.image,
                meta: `${t('year') || 'Year'} ${item.year}`,
                // Scoring props
                rawTitle: (item.title[locale as 'th' | 'en'] || item.title['en']) as string,
                rawSubtitle: (item.project[locale as 'th' | 'en'] || item.project['en']) as string
            })),
            ...serviceResults.map((item: StudentServiceDoc) => ({
                type: 'service' as const,
                title: (item.title[locale as 'th' | 'en'] || item.title['en']) as string,
                subtitle: item.category,
                url: item.link || '/services',
                image: undefined, // Changed from null to undefined to match SearchResultItem's image?: string
                meta: 'Download',
                // Scoring params
                rawTitle: (item.title[locale as 'th' | 'en'] || item.title['en']) as string,
            }))
        ];

        // Hack helper for 't' function if not available in API routes (next-intl usually works in components)
        function t(key: string) {
            return key === 'year' ? (locale === 'th' ? 'ปี' : 'Year') : '';
        }

        // 8. Scoring & Ranking Algorithm
        const qLower = q.toLowerCase();

        const scoredItems = allItems.map(item => {
            let score = 0;
            const title = (item.rawTitle || '').toLowerCase();

            // Exact Match Bonus
            if (title === qLower) score += 100;
            // Stars With Bonus
            else if (title.startsWith(qLower)) score += 80;
            // Contains Bonus
            else if (title.includes(qLower)) score += 60;
            // Smart Regex Match (Partial words)
            else score += 40;

            // Type-specific scoring
            if (item.type === 'page' && item.rawKeywords) {
                const keywordMatch = item.rawKeywords.find((k: string) => k === qLower);
                if (keywordMatch) score += 50;
                else if (item.rawKeywords.some((k: string) => k.includes(qLower))) score += 20;
            }

            if (item.type === 'personnel') {
                if (item.rawSubtitle?.toLowerCase().includes(qLower)) score += 30;
            }

            if (item.type === 'news' && item.rawDate) {
                // Recency boost for news (small factor)
                const ageInDays = (Date.now() - new Date(item.rawDate).getTime()) / (1000 * 60 * 60 * 24);
                if (ageInDays < 30) score += 10;
                if (ageInDays < 7) score += 5;
            }

            if (item.type === 'award') score += 10; // Slight boost for achievements

            return { ...item, score };
        });

        // Sort by Score DESC
        scoredItems.sort((a, b) => b.score - a.score);

        // 9. Return Top Results (cleaned)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const finalResults = scoredItems.slice(0, 15).map(({ rawTitle, rawSubtitle, rawKeywords, rawSummary, rawDate, score, ...rest }) => rest);

        return NextResponse.json({
            results: finalResults
        });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
