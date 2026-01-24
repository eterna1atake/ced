"use client";
// เพจข้อมูลบุคลากรที่ดึง hero ข้อความจาก i18n และใช้ navbar ซ้อนทับพื้นหลัง
import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import CompactPersonnelCard from "@/components/personnel/CompactPersonnelCard";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedString } from "@/types";
import type { IPersonnel } from "@/collections/Personnel";

// Extend IPersonnel for usage in component or just use it directly
// We need to map IPersonnel to what CompactPersonnelCard expects if different
// CompactPersonnelCard likely expects the old Personnel interface.
// Let's inspect CompactPersonnelCard or just assume properties match mostly.
// Actually, IPersonnel uses { th: string, en: string } for localized fields, similar to LocalizedString

type Props = {
  allPersonnel: IPersonnel[];
};

export default function StaffClient({ allPersonnel }: Props) {
  const t = useTranslations("Personnel");
  const breadcrumb = useTranslations("Breadcrumbs");
  const locale = useLocale();
  const lang = locale as keyof LocalizedString;

  // Helper to check position
  const isExecutive = (p: IPersonnel) =>
    p.position.th.includes("รองหัวหน้า") ||
    p.position.th.includes("ผู้ประสานงาน") ||
    p.position.en.includes("Deputy Head") ||
    p.position.en.includes("Coordinator");

  const isHead = (p: IPersonnel) =>
    p.position.th.includes("หัวหน้าภาควิชา") && !p.position.th.includes("รอง");

  const isStaff = (p: IPersonnel) =>
    p.position.th.includes("เจ้าหน้าที่") ||
    p.position.en.includes("Staff");

  // Filter staff into tiers
  // This logic works if the data is migrated correctly.
  const headOfDepartment = allPersonnel.filter(isHead);
  const executives = allPersonnel.filter(isExecutive);
  const staff = allPersonnel.filter(isStaff);
  // Faculty are those who are NOT head, NOT executive, and NOT staff
  const faculty = allPersonnel.filter(p => !isHead(p) && !isExecutive(p) && !isStaff(p));

  const content = {
    th: {
      structureTitle: "โครงสร้างบุคลากรของภาควิชาคอมพิวเตอร์ศึกษา",
      structureDesc: "ภาควิชาคอมพิวเตอร์ศึกษาประกอบด้วยคณาจารย์ผู้ทรงคุณวุฒิและบุคลากรที่มุ่งมั่นในการพัฒนาการศึกษา",
      head: "หัวหน้าภาควิชา",
      deputy: "รองหัวหน้าภาควิชา",
      faculty: "คณาจารย์",
      staff: "เจ้าหน้าที่"
    },
    en: {
      structureTitle: "Personnel Structure of Computer Education Department",
      structureDesc: "The Department of Computer Education consists of qualified faculty and staff dedicated to educational development.",
      head: "Head of Department",
      deputy: "Deputy Head of Department",
      faculty: "Faculty Members",
      staff: "Supporting Staff"
    }
  };

  return (
    <main className="bg-slate-50/50 pb-20">
      <HeroBanner
        title={t("title")}
        description={t("description")}
        eyebrow="Introduction"
        imageAlt={t("title")}
      />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-10">
          <Breadcrumbs
            items={[
              { href: `/${locale}`, label: breadcrumb("home") },
              { label: breadcrumb("personnel") },
            ]}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pt-12 lg:px-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{content[lang].structureTitle}</h2>
        <p className="mt-4 text-slate-600 max-w-7xl mx-auto">
          {content[lang].structureDesc}
        </p>
      </section>

      <div className="mx-auto mt-12 w-full max-w-7xl px-6 lg:px-10 space-y-16">
        {/* Tier 1: Head of Department */}
        {headOfDepartment.length > 0 && (
          <section className="flex flex-col items-center">
            <div className="mb-8 flex items-center justify-center gap-4">
              <div className="h-0.5 w-12 bg-gradient-to-l from-primary-main to-transparent sm:w-20"></div>
              <h3 className="text-xl font-bold text-primary-main uppercase tracking-wider text-center">
                {content[lang].head}
              </h3>
              <div className="h-0.5 w-12 bg-gradient-to-r from-primary-main to-transparent sm:w-20"></div>
            </div>
            <div className="flex justify-center gap-6 flex-wrap">
              {headOfDepartment.map((person) => (
                <div key={person._id} className="w-full max-w-[200px] sm:w-48 lg:w-56">
                  <CompactPersonnelCard
                    id={person._id!}
                    imageSrc={person.imageSrc}
                    name={person.name[lang]}
                    position={person.position[lang]}
                    email={person.email}
                    slug={person.slug}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tier 2: Executives / Deputy Heads */}
        {executives.length > 0 && (
          <section className="flex flex-col items-center">
            <div className="mb-10 flex items-center justify-center gap-4">
              <div className="h-0.5 w-12 bg-gradient-to-l from-primary-main to-transparent sm:w-20"></div>
              <h3 className="text-xl font-bold text-primary-main uppercase tracking-wider text-center">
                {content[lang].deputy}
              </h3>
              <div className="h-0.5 w-12 bg-gradient-to-r from-primary-main to-transparent sm:w-20"></div>
            </div>

            <div className="grid w-full grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-10 lg:gap-16">
              {executives.map((person) => (
                <div key={person._id} className="w-full sm:w-48 lg:w-56">
                  <CompactPersonnelCard
                    id={person._id!}
                    imageSrc={person.imageSrc}
                    name={person.name[lang]}
                    position={person.position[lang]}
                    email={person.email}
                    slug={person.slug}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tier 3: Faculty */}
        {faculty.length > 0 && (
          <section className="flex flex-col items-center">
            <div className="mb-12 flex items-center justify-center gap-4">
              <div className="h-0.5 w-12 bg-gradient-to-l from-primary-main to-transparent sm:w-20"></div>
              <h3 className="text-xl font-bold text-primary-main uppercase tracking-wider text-center">
                {content[lang].faculty}
              </h3>
              <div className="h-0.5 w-12 bg-gradient-to-r from-primary-main to-transparent sm:w-20"></div>
            </div>
            <div className="grid w-full grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-10 lg:gap-x-12 lg:gap-y-16">
              {faculty.map((person) => (
                <div key={person._id} className="w-full sm:w-48 lg:w-56">
                  <CompactPersonnelCard
                    id={person._id!}
                    imageSrc={person.imageSrc}
                    name={person.name[lang]}
                    position={person.position[lang]}
                    email={person.email}
                    slug={person.slug}
                  />
                </div>
              ))}
            </div>
          </section>

        )}

        {/* Tier 4: Staff */}
        {staff.length > 0 && (
          <section className="flex flex-col items-center">
            <div className="mb-12 flex items-center justify-center gap-4">
              <div className="h-0.5 w-12 bg-gradient-to-l from-primary-main to-transparent sm:w-20"></div>
              <h3 className="text-xl font-bold text-primary-main uppercase tracking-wider text-center">
                {content[lang].staff}
              </h3>
              <div className="h-0.5 w-12 bg-gradient-to-r from-primary-main to-transparent sm:w-20"></div>
            </div>
            <div className="grid w-full grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-10 lg:gap-x-12 lg:gap-y-16">
              {staff.map((person) => (
                <div key={person._id} className="w-full sm:w-48 lg:w-56">
                  <CompactPersonnelCard
                    id={person._id!}
                    imageSrc={person.imageSrc}
                    name={person.name[lang]}
                    position={person.position[lang]}
                    email={person.email}
                    slug={person.slug}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </main >


  );
}
