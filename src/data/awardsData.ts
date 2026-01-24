import { Award } from "@/types/award";

export const awards: Award[] = [
    {
        id: "1",
        title: { th: "รางวัลรองชนะเลิศอันดับ 1", en: "1st Runner-up Award" },
        project: { th: "โปรแกรมนำเสนอสัตว์น้ำใต้ทะเล", en: "Underwater Marine Life Presentation Program" },
        team: [{ th: "นายอวิรุทธ์ สุวรรณรัตน์", en: "Mr. Avirut Suwannarat" }, { th: "นายสายัญ พรหมปัญโญ", en: "Mr. Sayan Prompanyo" }],
        advisors: [{ th: "ผศ.ดร.จิรพันธุ์ ศรีสมพันธุ์", en: "Asst. Prof. Dr. Jiraphan Srisomphan" }],
        image: "/images/award/award1.jpg",
        year: "2542",
        date: "พ.ศ. 2542"
    },
    {
        id: "2",
        title: { th: "รางวัลรองชนะเลิศอันดับ 1", en: "1st Runner-up Award" },
        project: { th: "โปรแกรมเกมรามเกียรต์", en: "Ramakien Game Program" },
        team: [
            { th: "นายสุทิน ธรรมสุวรรณ", en: "Mr. Sutin Thamsuwan" },
            { th: "นางสาวนิสากร ทองสุวรรณ", en: "Ms. Nisakorn Thongsuwan" },
            { th: "นางสาวรุ่งนพพร ศรีนันทวงศ์", en: "Ms. Rungnopporn Srinanthawong" }
        ],
        advisors: [{ th: "นายกฤช แย้มสระโส", en: "Mr. Krit Yamsraso" }],
        image: "/images/award/award2.jpg",
        year: "2543",
        date: "พ.ศ. 2543"
    },
    {
        id: "3",
        title: { th: "รางวัลดีเด่น", en: "Outstanding Award" },
        project: { th: "มัลติมีเดียสารนุกรมสำหรับเด็ก เรื่องวิทยาศาสตร์น่ารู้", en: "Multimedia Encyclopedia for Kids: Interesting Science" },
        team: [{ th: "นายปิติ ยินดี", en: "Mr. Piti Yindee" }, { th: "นายชูใจ ใฝ่ดี", en: "Mr. Chujai Faidee" }],
        advisors: [{ th: "ผศ.ดร.มานะ อดทน", en: "Asst. Prof. Dr. Mana Odthon" }],
        image: "/images/award/award3.jpg",
        year: "2543",
        date: "พ.ศ. 2543"
    },
    {
        id: "4",
        title: { th: "รองอันดับ 2", en: "2nd Runner-up" },
        project: { th: "บทเรียนคอมพิวเตอร์ช่วยสอนแบบมัลติมีเดีย วิชาภาษาไทย ในระดับชั้นประถมศึกษา ปีที่ 4", en: "Multimedia CAI for Thai Language, Grade 4" },
        team: [{ th: "นายศุภชัย จันฝาก", en: "Mr. Supachai Chanfak" }, { th: "นายโองการ กุลสมบัติ", en: "Mr. Ongkan Kunsombat" }],
        advisors: [{ th: "ผศ.ดร.จิรพันธุ์ ศรีสมพันธุ์", en: "Asst. Prof. Dr. Jiraphan Srisomphan" }],
        image: "/images/award/award4.jpg",
        year: "2544",
        date: "พ.ศ. 2544"
    },
    {
        id: "5",
        title: { th: "รางวัลชนะเลิศอันดับ 1", en: "Winner Award" },
        project: { th: "ชุดโปรแกรมคอมพิวเตอร์ประกอบฮาร์ดแวร์เพื่อการเรียนรู้ เรื่อง การเชื่อมต่อ PC กับ อุปกรณ์ภายนอกผ่านพอร์ตอนุกรม", en: "Computer Program for Hardware Learning: PC Interfacing via Serial Port" },
        team: [{ th: "นายเจษฏา จรัญรัตน์", en: "Mr. Jessada Charanrat" }, { th: "นายสันติกาญจน์ แซ่ฉั่ว", en: "Mr. Santikan Saechua" }],
        advisors: [{ th: "ดร.สมคิด แซ่หลี", en: "Dr. Somkid Saelee" }],
        image: "/images/award/award5.jpg",
        year: "2545",
        date: "พ.ศ. 2545"
    },
    {
        id: "6",
        title: { th: "รองชนะเลิศอันดับ 1", en: "1st Runner-up" },
        project: { th: "โปรแกรมเกมบางระจัน", en: "Bang Rajan Game" },
        team: [{ th: "นายบุญธรรม พันธ์ใหญ่", en: "Mr. Boontham Panyai" }, { th: "นายหาญศักดิ์ ชมบุญ", en: "Mr. Hansak Chomboon" }],
        advisors: [{ th: "ผศ.ดร.กฤช สินธนะกุล", en: "Asst. Prof. Dr. Krit Sinthanakul" }],
        image: "/images/award/award6.jpg",
        year: "2545",
        date: "พ.ศ. 2545"
    },
    {
        id: "7",
        title: { th: "รางวัลชมเชย", en: "Honorable Mention" },
        project: { th: "บทเรียนคอมพิวเตอร์ช่วยสอน ประกอบลูกคิด เรื่องการใช้ลูกคิดญี่ปุ่น", en: "CAI with Abacus: Using Japanese Abacus" },
        team: [{ th: "นายจักราวัฒน์ วรรณกลัด", en: "Mr. Jakrawat Wannaklad" }, { th: "นายแสนศักดิ์ มุ่งสุข", en: "Mr. Saensak Mungsuk" }],
        advisors: [{ th: "ผศ.ดร.กฤช สินธนะกุล", en: "Asst. Prof. Dr. Krit Sinthanakul" }],
        image: "/images/award/award7.jpg",
        year: "2546",
        date: "พ.ศ. 2546"
    },
    {
        id: "8",
        title: { th: "รางวัลชมเชย", en: "Honorable Mention" },
        project: { th: "เครื่องกำเนิดคลื่นหัวใจ 13 ลีด แบบหลายรูปคลื่น", en: "13-Lead Multi-Waveform ECG Generator" },
        team: [{ th: "นายเกียรติศักดิ์ โยชะนัง", en: "Mr. Kiattisak Yochanang" }, { th: "นายชาตรี ทับทอง", en: "Mr. Chatree Tubthong" }],
        advisors: [{ th: "ดร.วิทวัส ทิพย์สุวรรณ", en: "Dr. Wittawat Tipphayasuwan" }],
        image: "/images/award/award8.jpg",
        year: "2547",
        date: "พ.ศ. 2547"
    },
    {
        id: "9",
        title: { th: "รางวัลชมเชย", en: "Honorable Mention" },
        project: { th: "เกมตำนานผู้กล้า", en: "Legend of the Brave Game" },
        team: [{ th: "นายศักดิ์ชัย ไพศาลวัฒนการณ์", en: "Mr. Sakchai Paisanwattanakarn" }, { th: "นายวิฑูร คงผล", en: "Mr. Witoon Kongphol" }],
        advisors: [{ th: "ดร.วิทวัส ทิพย์สุวรรณ", en: "Dr. Wittawat Tipphayasuwan" }],
        image: "/images/award/award9.jpg",
        year: "2547",
        date: "พ.ศ. 2547"
    },
    {
        id: "10",
        title: { th: "รางวัลดีเด่น", en: "Outstanding Award" },
        project: { th: "เกมสงครามยาเสพติด", en: "Drug War Game" },
        team: [{ th: "นายสุวิท มหานิยม", en: "Mr. Suwit Mahaniyom" }],
        advisors: [{ th: "ผศ.ดร.จิรพันธุ์ ศรีสมพันธุ์", en: "Asst. Prof. Dr. Jiraphan Srisomphan" }],
        image: "/images/award/award10.jpg",
        year: "2548",
        date: "พ.ศ. 2548"
    },
    {
        id: "11",
        title: { th: "รางวัลชนะเลิศอันดับ 1", en: "Winner Award" },
        project: { th: "โครงการTEACHING ACADEMY AWARD 2018 ณ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา จังหวัดเชียงใหม่ สาขาคอมพิวเตอร์", en: "TEACHING ACADEMY AWARD Project 2018 at RMUTL, Chiang Mai (Computer Field)" },
        team: [{ th: "นางสาวณัฐชยา สีดาจันทร์", en: "Ms. Natchaya Sidachan" }, { th: "นายพิพัฒน์พณ ศรีศุวรรณ", en: "Mr. Phiphatphon Srisuwan" }],
        advisors: [{ th: "ผศ.ดร. กฤช สินธนะกุล", en: "Asst. Prof. Dr. Krit Sinthanakul" }],
        image: "/images/award/award11.jpg",
        gallery: [
            "/images/award/award8.jpg",
            "/images/award/award9.jpg",
            "/images/award/award10.jpg"
        ],
        year: "2561",
        date: "พ.ศ. 2561"
    },
    {
        id: "12",
        title: { th: "รางวัลชนะเลิศอันดับ 1", en: "Winner Award" },
        project: { th: "โครงการประกวดความเป็นเลิศในการจัดการเรียนรู้ระดับอุดมศึกษา เรื่อง ช่างสิบหมู่ ณ มหาวิทยาลัยเกษตรศาสตร์", en: "Excellence in Higher Education Management Contest: Chang Sip Mu at Kasetsart University" },
        team: [
            { th: "นายโสภณัส แซ่ฝ้า", en: "Mr. Soponnat Sae-fa" },
            { th: "นายศรัณย์ มาเดช", en: "Mr. Sarun Madech" },
            { th: "นายณัฐนนท์ คงเนียม", en: "Mr. Natthanon Kongniam" }
        ],
        advisors: [
            { th: "ผศ.ดร.จิรพันธุ์ ศรีสมพันธุ์", en: "Asst. Prof. Dr. Jiraphan Srisomphan" },
            { th: "ผศ.ดร. กฤช สินธนะกุล", en: "Asst. Prof. Dr. Krit Sinthanakul" }
        ],
        image: "/images/award/award12.jpg",
        gallery: [
            "/images/award/award9.jpg",
            "/images/award/award10.jpg",
            "/images/award/award11.jpg"
        ],
        year: "2561",
        date: "พ.ศ. 2561"
    }
];
