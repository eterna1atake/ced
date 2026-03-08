import type { Personnel } from "@/types/personnel";

export function isDoctor(person: Personnel): boolean {
    return (person.education || []).some(edu => {
        const lvEn = edu.level?.en?.toLowerCase() || '';
        const lvTh = edu.level?.th?.toLowerCase() || '';
        return (
            lvEn.includes('phd') ||
            lvEn.includes('ph.d') ||
            lvEn.includes('doctor') ||
            lvTh.includes('ปริญญาเอก') ||
            lvTh.includes('ดุษฎีบัณฑิต') ||
            lvTh.includes('ป.เอก') ||
            lvTh.includes('doctor') ||
            lvEn.includes('degree') && lvEn.includes('doctor')
        );
    });
}

export function formatPersonnelName(person: Personnel, lang: 'th' | 'en'): string {
    const baseName = person.name?.[lang] || '';
    const title = person.academicTitle?.[lang] || '';

    let prefix = '';

    if (title) {
        prefix += title;
    }

    if (isDoctor(person)) {
        if (lang === 'th') {
            prefix += prefix ? ' ดร.' : 'ดร.';
        } else {
            prefix += prefix ? ' Dr.' : 'Dr.';
        }
    }

    if (prefix) {
        if (lang === 'en') {
            return `${prefix} ${baseName}`;
        } else {
            // ในภาษาไทย ปกติจะเขียนติดกันถ้าลงท้ายด้วยจุด(ดร.) แต่ถ้าเป็นแค่ตำแหน่ง(ไม่มีจุด)อาจจะเว้นวรรคนิดนึง
            const space = prefix.endsWith('.') ? '' : ' ';
            return `${prefix}${space}${baseName}`.trim();
        }
    }

    return baseName;
}
