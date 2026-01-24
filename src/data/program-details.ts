import { ProgramDetailData } from "@/types/program";

export const PROGRAM_DETAILS: Record<string, ProgramDetailData> = {
    ced: {
        id: "ced",
        name: {
            th: "สาขาวิชาเทคโนโลยีคอมพิวเตอร์ (4 ปี)",
            en: "Computer Technology (4 Years)",
        },
        degree: {
            full: {
                th: "ครุศาสตร์อุตสาหกรรมบัณฑิต (เทคโนโลยีคอมพิวเตอร์)",
                en: "Bachelor of Science in Technical Education (Computer Technology)",
            },
            short: {
                th: "ค.อ.บ. (เทคโนโลยีคอมพิวเตอร์)",
                en: "B.S.Tech.Ed. (Computer Technology)",
            }
        },
        gradAttribute: {
            title: { th: "คุณลักษณะบัณฑิตของหลักสูตร", en: "Graduate Attributes" },
            description: {
                th: "บัณฑิตที่สำเร็จหลักสูตรครุศาสตร์อุตสาหกรรมบัณฑิต (เทคโนโลยีคอมพิวเตอร์) ต้องมีทักษะและคุณลักษณะที่เหมาะสมกับสถานการณ์ที่เกิดขึ้นในสังคมและองค์กร",
                en: "Graduates must possess skills and attributes suitable for current social and organizational contexts.",
            }
        },
        major: {
            title: { th: "วิชาเอก", en: "Major" },
            description: { th: "ไม่มี", en: "None" },
        },
        highlights: {
            title: { th: "จุดเด่นของหลักสูตร", en: "Program Highlights" },
            items: [
                {
                    title: { th: "Job Ready with T-Shaped Skills", en: "Job Ready with T-Shaped Skills" },
                    description: {
                        th: "หลักสูตรมุ่งเน้นพัฒนาบัณฑิตที่มีความพร้อมในการทำงานในภาคอุตสาหกรรม...",
                        en: "Focuses on developing graduates ready for industry work with broad and deep competencies (T-Shaped Skills).",
                    }
                },
                {
                    title: { th: "Multiple Learning Pathways", en: "Multiple Learning Pathways" },
                    description: {
                        th: "หลักสูตรมีเส้นทางการเรียนรู้ที่หลากหลาย...",
                        en: "Offers various learning pathways allowing students to choose careers that match their interests.",
                    }
                },
                {
                    title: { th: "Multiple Learning Pathways", en: "Multiple Learning Pathways" },
                    description: {
                        th: "หลักสูตรมีเส้นทางการเรียนรู้ที่หลากหลาย...",
                        en: "Offers various learning pathways allowing students to choose careers that match their interests.",
                    }
                },
            ],
        },
        suitableFor: {
            title: { th: "หลักสูตรนี้เหมาะกับใคร", en: "Who is this program for?" },
            items: [
                { th: "ผู้ที่มีความสนใจทางด้านเทคโนโลยีสารสนเทศ...", en: "Those interested in IT and high-demand careers." },
                { th: "ผู้ที่ชอบเรียนรู้จากการลงมือปฏิบัติ", en: "Those who prefer hands-on learning." },
            ],
        },
        curriculum: [
            {
                title: { th: "1. หมวดวิชาศึกษาทั่วไป", en: "1. General Education" },
                credits: "30",
                items: [
                    {
                        id: "1.1",
                        title: { th: "1.1 กลุ่มวิชาสังคมศาสตร์และมนุษยศาสตร์", en: "1.1 Social Sciences and Humanities" },
                        credits: "6",
                        isBold: false
                    },
                    {
                        id: "1.2",
                        title: { th: "1.2 กลุ่มวิชาภาษา", en: "1.2 Language Courses" },
                        credits: "12",
                        isBold: false,
                        subItems: [
                            { id: "1.2.1", title: { th: "1.2.1 วิชาบังคับ", en: "1.2.1 Compulsory" }, credits: "6", isBold: false },
                            { id: "1.2.2", title: { th: "1.2.2 วิชาเลือก", en: "1.2.2 Elective" }, credits: "6", isBold: false },
                        ]
                    },
                ],
            },
            {
                title: { th: "2. หมวดวิชาเฉพาะ", en: "2. Specific Courses" },
                credits: "106",
                items: [
                    {
                        id: "2.1",
                        title: { th: "2.1 กลุ่มวิชาแกน", en: "2.1 Core Courses" },
                        credits: "70",
                        isBold: true,
                        subItems: [
                            { id: "2.1.1", title: { th: "วิชาการศึกษา", en: "Education Courses" }, credits: "42", isBold: false },
                            { id: "2.1.2", title: { th: "วิชาพื้นฐานทางเทคโนโลยี", en: "Fundamental Technology" }, credits: "28", isBold: false },
                        ]
                    }
                ],
            }
        ],
        documents: [
            {
                name: { th: "เล่มหลักสูตร 2569 (4 ปี)", en: "Curriculum 2026 (4 Years)" },
                url: "/curriculum/ced/ced_2569.pdf"
            },
            {
                name: { th: "เล่มหลักสูตร 2564 (4 ปี)", en: "Curriculum 2021 (4 Years)" },
                url: "/curriculum/ced/ced_2564.pdf"
            },
        ],
        language: {
            th: "การจัดการเรียนการสอนใช้ภาษาไทยและภาษาอังกฤษ...",
            en: "Instruction involves both Thai and English languages...",
        },
        admission: {
            th: "รับนักศึกษาไทยและนักศึกษาต่างชาติที่สามารถใช้ภาษาไทยได้",
            en: "Accepts Thai students and international students proficient in Thai.",
        },
        careers: {
            title: { th: "อาชีพที่สามารถประกอบได้", en: "Career Paths" },
            items: [
                { th: "ครู/บุคลากรทางการศึกษา", en: "Teachers / Educational Personnel" },
                { th: "นักพัฒนาระบบคอมพิวเตอร์", en: "Computer System Developer" },
                { th: "นักวิชาการคอมพิวเตอร์", en: "Computer Technical Officer" },
            ],
        },
    },
    tct: {
        id: "tct",
        name: {
            th: "สาขาวิชาเทคโนโลยีคอมพิวเตอร์ (หลักสูตรเทียบโอน 3 ปี)",
            en: "Computer Technology (3 Years Transfer)",
        },
        degree: {
            full: {
                th: "ครุศาสตร์อุตสาหกรรมบัณฑิต (เทคโนโลยีคอมพิวเตอร์)",
                en: "Bachelor of Science in Technical Education (Computer Technology)",
            },
            short: {
                th: "ค.อ.บ. (เทคโนโลยีคอมพิวเตอร์)",
                en: "B.S.Tech.Ed. (Computer Technology)",
            }
        },
        gradAttribute: {
            title: { th: "คุณลักษณะบัณฑิตของหลักสูตร", en: "Graduate Attributes" },
            description: {
                th: "บัณฑิตต้องมีความรู้ความสามารถทั้งด้านวิชาการและวิชาชีพ...",
                en: "Graduates must possess both academic and professional competencies...",
            }
        },
        major: {
            title: { th: "วิชาเอก", en: "Major" },
            description: { th: "ไม่มี", en: "None" },
        },
        highlights: {
            title: { th: "จุดเด่นของหลักสูตร", en: "Program Highlights" },
            items: [
                {
                    title: { th: "Designed for Vocational Graduates", en: "Designed for Vocational Graduates" },
                    description: {
                        th: "หลักสูตรออกแบบสำหรับผู้จบ ปวส. โดยเฉพาะ...",
                        en: "Specially designed for Higher Vocational Certificate graduates...",
                    }
                },
            ],
        },
        suitableFor: {
            title: { th: "หลักสูตรนี้เหมาะกับใคร", en: "Who is this program for?" },
            items: [
                { th: "ผู้ที่จบการศึกษาระดับ ปวส. สายช่างอุตสาหกรรมหรือคอมพิวเตอร์", en: "Graduates with a High Vocational Certificate in Industrial or Computer fields." },
            ],
        },
        curriculum: [
            {
                title: { th: "หมวดวิชาศึกษาทั่วไป", en: "General Education" },
                credits: "30",
                items: [],
            },
            {
                title: { th: "หมวดวิชาเฉพาะ", en: "Specific Courses" },
                credits: "76",
                items: [],
            }
        ],
        documents: [
            {
                name: { th: "เล่มหลักสูตรเทียบโอน", en: "Transfer Curriculum" },
                url: "/curriculum/ced/ced_transfer.pdf"
            }
        ],
        language: {
            th: "การจัดการเรียนการสอนใช้ภาษาไทยและภาษาอังกฤษ",
            en: "Instruction in Thai and English.",
        },
        admission: {
            th: "รับผู้สำเร็จการศึกษาระดับ ปวส.",
            en: "Accepts High Vocational Certificate graduates.",
        },
        careers: {
            title: { th: "อาชีพที่สามารถประกอบได้", en: "Career Paths" },
            items: [
                { th: "ครูอาชีวศึกษา", en: "Vocational Teacher" },
                { th: "นักเทคโนโลยีคอมพิวเตอร์", en: "Computer Technologist" },
            ],
        },
    },

    // Master's Regular
    mtct: {
        id: "mtct",
        name: {
            th: "แขนงวิชาคอมพิวเตอร์ศึกษา ภาคปกติ (MTCT)",
            en: "Computer Education - Regular (MTCT)",
        },
        degree: {
            full: {
                th: "ครุศาสตร์อุตสาหกรรมมหาบัณฑิต (คอมพิวเตอร์ศึกษา)",
                en: "Master of Science in Technical Education (Computer Education)",
            },
            short: {
                th: "ค.อ.ม. (คอมพิวเตอร์ศึกษา)",
                en: "M.S.Tech.Ed. (Computer Education)",
            }
        },
        gradAttribute: {
            title: { th: "ปรัชญาหลักสูตร", en: "Program Philosophy" },
            description: {
                th: "มุ่งผลิตมหาบัณฑิตที่มีความรู้ความสามารถระดับสูงด้านคอมพิวเตอร์ศึกษา...",
                en: "Aims to produce master's graduates with advanced knowledge in computer education...",
            }
        },
        curriculum: [
            {
                title: { th: "หมวดวิชาสัมพันธ์", en: "Related Courses" },
                credits: "6",
                items: [
                    { id: "1", title: { th: "ระเบียบวิธีวิจัย", en: "Research Methodology" }, credits: "3" },
                    { id: "2", title: { th: "สถิติเพื่อการวิจัย", en: "Statistics for Research" }, credits: "3" }
                ],
            },
            {
                title: { th: "หมวดวิชาเอก", en: "Major Courses" },
                credits: "18",
                items: [
                    { id: "3", title: { th: "กลุ่มวิชาบังคับ", en: "Compulsory" }, credits: "9" },
                    { id: "4", title: { th: "กลุ่มวิชาเลือก", en: "Electives" }, credits: "9" }
                ],
            },
            {
                title: { th: "วิทยานิพนธ์", en: "Thesis" },
                credits: "12",
                items: [
                    { id: "5", title: { th: "วิทยานิพนธ์", en: "Thesis" }, credits: "12" }
                ],
            },
        ],
        documents: [
            {
                name: { th: "เล่มหลักสูตร ป.โท 2565", en: "Master Curriculum 2022" },
                url: "/curriculum/ced/master_2565.pdf"
            }
        ],
        language: {
            th: "จัดการเรียนการสอนเป็นภาษาไทย",
            en: "Conducted in Thai.",
        },
        admission: {
            th: "สำเร็จการศึกษาระดับปริญญาตรีหรือเทียบเท่า...",
            en: "Bachelor's degree or equivalent in related fields...",
        },
        careers: {
            title: { th: "อาชีพหลังสำเร็จการศึกษา", en: "Career Opportunities" },
            items: [
                { th: "อาจารย์ระดับอุดมศึกษา", en: "Higher Education Lecturer" },
                { th: "นักวิจัยด้านการศึกษา", en: "Educational Researcher" },
                { th: "นักเทคโนโลยีการศึกษา", en: "Educational Technologist" },
            ]
        }
    },

    // Master's Weekend
    smtct: {
        id: "smtct",
        name: {
            th: "แขนงวิชาคอมพิวเตอร์ศึกษา รอบเสาร์-อาทิตย์ (S-MTCT)",
            en: "Computer Education - Weekend (S-MTCT)",
        },
        degree: {
            full: {
                th: "ครุศาสตร์อุตสาหกรรมมหาบัณฑิต (คอมพิวเตอร์ศึกษา)",
                en: "Master of Science in Technical Education (Computer Education)",
            },
            short: {
                th: "ค.อ.ม. (คอมพิวเตอร์ศึกษา)",
                en: "M.S.Tech.Ed. (Computer Education)",
            }
        },
        gradAttribute: {
            title: { th: "ปรัชญาหลักสูตร", en: "Program Philosophy" },
            description: {
                th: "พัฒนาบุคลากรประจำการให้มีความเชี่ยวชาญเฉพาะทาง...",
                en: "Developing in-service personnel to have specialized expertise...",
            }
        },
        curriculum: [
            {
                title: { th: "หมวดวิชาสัมพันธ์", en: "Related Courses" },
                credits: "6",
                items: [],
            },
            {
                title: { th: "หมวดวิชาเอก", en: "Major Courses" },
                credits: "18",
                items: [],
            },
            {
                title: { th: "การค้นคว้าอิสระ", en: "Independent Study" },
                credits: "6",
                items: [],
            },
        ],
        documents: [
            {
                name: { th: "เล่มหลักสูตร ป.โท (พิเศษ) 2565", en: "Master Curriculum (Special) 2022" },
                url: "/curriculum/ced/master_special_2565.pdf"
            }
        ],
        language: {
            th: "จัดการเรียนการสอนเป็นภาษาไทย (เสาร์-อาทิตย์)",
            en: "Conducted in Thai (Weekend Program).",
        },
        admission: {
            th: "สำเร็จการศึกษาระดับปริญญาตรีและมีประสบการณ์ทำงาน...",
            en: "Bachelor's degree with work experience...",
        },
        careers: {
            title: { th: "อาชีพหลังสำเร็จการศึกษา", en: "Career Opportunities" },
            items: [
                { th: "ผู้บริหารเทคโนโลยีสารสนเทศ", en: "IT Manager/Executive" },
                { th: "หัวหน้าฝ่ายฝึกอบรม", en: "Training Manager" },
            ]
        }
    },

    // Doctoral
    phd: {
        id: "phd",
        name: {
            th: "สาขาวิชาคอมพิวเตอร์ศึกษา (ปริญญาเอก)",
            en: "Computer Education (PhD)",
        },
        degree: {
            full: {
                th: "ครุศาสตร์อุตสาหกรรมดุษฎีบัณฑิต (คอมพิวเตอร์ศึกษา)",
                en: "Doctor of Philosophy in Technical Education (Computer Education)",
            },
            short: {
                th: "ค.อ.ด. (คอมพิวเตอร์ศึกษา)",
                en: "Ph.D. (Computer Education)",
            }
        },
        gradAttribute: {
            title: { th: "ปรัชญาหลักสูตร", en: "Program Philosophy" },
            description: {
                th: "สร้างนักวิจัยและนักวิชาการขั้นสูง...",
                en: "Creating advanced researchers and scholars...",
            }
        },
        curriculum: [
            {
                title: { th: "หมวดวิชาบังคับ", en: "Compulsory Courses" },
                credits: "12",
                items: [],
            },
            {
                title: { th: "วิทยานิพนธ์", en: "Thesis" },
                credits: "36",
                items: [],
            },
        ],
        documents: [
            {
                name: { th: "เล่มหลักสูตร ป.เอก 2565", en: "PhD Curriculum 2022" },
                url: "/curriculum/ced/phd_2565.pdf"
            }
        ],
        language: {
            th: "จัดการเรียนการสอนเป็นภาษาไทยและอังกฤษ",
            en: "Conducted in Thai and English.",
        },
        admission: {
            th: "สำเร็จการศึกษาระดับปริญญาโทสาขาที่เกี่ยวข้อง...",
            en: "Master's degree in related fields...",
        },
        careers: {
            title: { th: "อาชีพหลังสำเร็จการศึกษา", en: "Career Opportunities" },
            items: [
                { th: "อาจารย์มหาวิทยาลัย", en: "University Professor" },
                { th: "นักวิจัยระดับสูง", en: "Senior Researcher" },
                { th: "ที่ปรึกษาด้านนวัตกรรม", en: "Innovation Consultant" },
            ]
        }
    }
};

export function getProgramDetail(id: string): ProgramDetailData | undefined {
    return PROGRAM_DETAILS[id];
}
