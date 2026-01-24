import { ProgramItem } from "@/types/program";

export const PROGRAMS_SEED: ProgramItem[] = [
    {
        id: "ced",
        level: "bachelor",
        imageSrc: "/images/mockup/Template-for-New-Website-1-1536x864.png",
        imageAlt: "Computer Technology 4 Years",
        link: "/programs/bachelor/ced", // Suffix
        th: {
            degree: "หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)",
            title: "สาขาวิชาเทคโนโลยีคอมพิวเตอร์ (4 ปี)",
            subtitle: "Bachelor of Science in Technical Education Program in Computer Technology",
            description: "หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต สาขาเทคโนโลยีคอมพิวเตอร์ เป็นหลักสูตร 4 ปี (8 ภาคการศึกษา) จำนวนหน่วยกิตรวม 106 หน่วยกิต เน้นสายวิชาการและ/หรือวิชาชีพ",
        },
        en: {
            degree: "Bachelor of Science in Technical Education (B.S.Tech.Ed.)",
            title: "Computer Technology (4 Years)",
            subtitle: "Bachelor of Science in Technical Education Program in Computer Technology",
            description: "A 4-year program (8 semesters) with 106 total credits, focusing on academic and professional development in computer technology education.",
        },
    },
    {
        id: "tct",
        level: "bachelor",
        imageSrc: "/images/mockup/25-1536x864.png",
        imageAlt: "Computer Technology 3 Years",
        link: "/programs/bachelor/tct", // Link to TCT
        th: {
            degree: "หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (ค.อ.บ.)",
            title: "สาขาวิชาเทคโนโลยีคอมพิวเตอร์ (หลักสูตรเทียบโอน 3 ปี)",
            subtitle: "Bachelor of Science in Technical Education Program in Computer Technology",
            description: "หลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต สาขาเทคโนโลยีคอมพิวเตอร์ (เทียบโอน) เป็นหลักสูตร 3 ปี เน้นผู้ที่จบ ปวส. มาศึกษาต่อ",
        },
        en: {
            degree: "Bachelor of Science in Technical Education (B.S.Tech.Ed.)",
            title: "Computer Technology (3 Years Transfer)",
            subtitle: "Bachelor of Science in Technical Education Program in Computer Technology",
            description: "A 3-year transfer program designed for students with a Higher Vocational Certificate.",
        },
    },
    {
        id: "mtct",
        level: "master",
        imageSrc: "/images/mockup/cs.png",
        imageAlt: "Computer Education Master",
        link: "/programs/master/mtct", // Link to MTCT
        th: {
            degree: "หลักสูตรครุศาสตร์อุตสาหกรรมมหาบัณฑิต (ค.อ.ม.)",
            title: "แขนงวิชาคอมพิวเตอร์ศึกษา ภาคปกติ (MTCT)",
            subtitle: "Master of Science in Technical Education (Computer Education)",
            description: "หลักสูตรครุศาสตร์อุตสาหกรรมมหาบัณฑิต สาขาวิชาคอมพิวเตอร์ศึกษา เป็นหลักสูตร 2 ปี (4 ภาคการศึกษา) จำนวนหน่วยกิตรวม 106 หน่วยกิต เน้นสายวิชาการและ/หรือวิชาชีพ",
        },
        en: {
            degree: "Master of Science in Technical Education (M.S.Tech.Ed.)",
            title: "Computer Education - Regular (MTCT)",
            subtitle: "Master of Science in Technical Education (Computer Education)",
            description: "A 2-year program (4 semesters) with 106 total credits, focusing on advanced academic and professional development.",
        },
    },
    {
        id: "smtct",
        level: "master",
        imageSrc: "/images/mockup/cs.png",
        imageAlt: "Computer Education Master",
        link: "/programs/master/smtct", // Link to S-MTCT
        th: {
            degree: "หลักสูตรครุศาสตร์อุตสาหกรรมมหาบัณฑิต (ค.อ.ม.)",
            title: "แขนงวิชาคอมพิวเตอร์ศึกษา รอบเสาร์-อาทิตย์ (S-MTCT)",
            subtitle: "Master of Science in Technical Education (Computer Education)",
            description: "หลักสูตรครุศาสตร์อุตสาหกรรมมหาบัณฑิต สาขาวิชาคอมพิวเตอร์ศึกษา เป็นหลักสูตร 2 ปี (4 ภาคการศึกษา) จำนวนหน่วยกิตรวม 106 หน่วยกิต เน้นสายวิชาการและ/หรือวิชาชีพ",
        },
        en: {
            degree: "Master of Science in Technical Education (M.S.Tech.Ed.)",
            title: "Computer Education - Weekend (S-MTCT)",
            subtitle: "Master of Science in Technical Education (Computer Education)",
            description: "A 2-year weekend program (4 semesters) with 106 total credits, focusing on advanced academic and professional development.",
        },
    },
    {
        id: "phd",
        level: "doctoral",
        imageSrc: "/images/mockup/ibis.png",
        imageAlt: "Computer Education PhD",
        link: "/programs/phd", // Link to PhD
        th: {
            degree: "หลักสูตรครุศาสตร์อุตสาหกรรมดุษฎีบัณฑิต (ค.อ.ด.)",
            title: "สาขาวิชาคอมพิวเตอร์ศึกษา",
            subtitle: "Doctor of Philosophy in Technical Education (Computer Education)",
            description: "หลักสูตรครุศาสตร์อุตสาหกรรมดุษฎีบัณฑิต สาขาวิชาคอมพิวเตอร์ศึกษา เป็นหลักสูตร 3 ปี จำนวนหน่วยกิตรวม 48 หน่วยกิต เน้นการวิจัยและพัฒนาองค์ความรู้ใหม่",
        },
        en: {
            degree: "Doctor of Philosophy in Technical Education (Ph.D.)",
            title: "Computer Education",
            subtitle: "Doctor of Philosophy in Technical Education (Computer Education)",
            description: "A 3-year doctoral program with 48 total credits, emphasizing research and the development of new knowledge.",
        },
    },
];

export function getPrograms(locale: string) {
    const isThai = locale === "th";
    const lang = isThai ? "th" : "en";

    return PROGRAMS_SEED.map((item) => ({
        level: item.level,
        imageSrc: item.imageSrc,
        imageAlt: item.imageAlt,
        buttonLink: `/${locale}${item.link}`,
        degree: item[lang].degree,
        title: item[lang].title,
        subtitle: item[lang].subtitle,
        description: item[lang].description,
    }));
}
