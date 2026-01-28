"use client";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import HeroBanner from "@/components/common/HeroBanner";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faLocationDot, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import FloatingBackButton from "@/components/common/FloatingBackButton";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";

export default function ContactUsPageClient() {
  const locale = useLocale();
  const t = useTranslations("ContactUsPage");
  const breadcrumb = useTranslations("Breadcrumbs");
  const { settings } = useGlobalSettings();

  const address = locale === 'th' ? settings.contact.address.th : settings.contact.address.en;
  const contactDepartment = locale === 'th' ? settings.contactDepartment.th : settings.contactDepartment.en;

  return (
    <div className="relative">
      <main>
        <HeroBanner
          title={t("title")}
          description={t("description")}
          eyebrow={t("eyebrow")}
          //imageSrc="/images/news/featured-768x512-1.jpg"
          imageAlt={t("title")}
        />

        <section className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="border-b border-slate-200 bg-slate-50/80 py-4">
            <Breadcrumbs
              items={[
                { href: `/${locale}`, label: breadcrumb("home") },
                { label: breadcrumb("contactUs") },
              ]}
            />
          </div>
          <FloatingBackButton />
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("title")}</h1>

          <div className="mt-10 w-full">
            <article>
              <div>
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative h-full">
                      <Image
                        src="/images/asset/497774132_1274745884656811_7565284710272091613_n.jpg"
                        alt="Contact Us"
                        width={642}
                        height={424}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="h-full">
                      <div className="bg-primary-main/90 p-10 h-full flex flex-col space-y-6">
                        <h2 className="text-xl font-bold text-white">{contactDepartment || t("departmentName")} <br /> {t("universityName")}</h2>
                        <div className="flex flex-col gap-4">
                          <ul className="flex flex-col gap-2 text-gray-50">
                            <li className="flex items-center">
                              <FontAwesomeIcon icon={faPhone} className="mr-3" />
                              <span className="text-base">{settings.contact.phone || t("tel")}</span>
                            </li>
                            <li className="flex items-center">
                              <FontAwesomeIcon icon={faLocationDot} className="mr-3" />
                              <span className="text-base">{address || t("address")}</span>
                            </li>
                            <li className="flex items-center">
                              <FontAwesomeIcon icon={faEnvelope} className="mr-3" />
                              <span className="text-base">{settings.contact.email || "ced@fte.kmutnb.ac.th"}</span>
                            </li>
                            {settings.socials.facebook && (
                              <li className="flex items-center">
                                <FontAwesomeIcon icon={faFacebook} className="mr-3" />
                                <a href={settings.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-base hover:underline">
                                  Computer Education
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="mt-auto pt-6">
                          <hr className="h-0.25 w-full bg-slate-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="my-4">
                  <div className="bg-primary-nav px-10 py-6 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900">{t("complaintTitle")}</h2>
                    <div>
                      <p className="text-slate-900 text-base font-light ">{t("complaintDescription")}</p>
                    </div>
                    <div>
                      <Link href="https://fte.kmutnb.ac.th/index.php/qa/" className="inline-flex items-center gap-2 rounded-md border border-primary-main px-6 py-2 text-sm font-semibold text-white bg-primary-main transition-colors duration-200 hover:bg-transparent hover:text-primary-main">
                        {t("complaintButton")}
                      </Link>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="w-full h-[450px] overflow-hidden shadow-sm">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.3081114357933!2d100.51549419999999!3d13.8205282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b9b82627c21%3A0x3de00fab1be62cff!2z4Lig4Liy4LiE4Lin4Li04LiK4Liy4LiE4Lit4Lih4Lie4Li04Lin4LmA4LiV4Lit4Lij4LmM4Lio4Li24LiB4Lip4LiyIERlcGFydG1lbnQgb2YgQ29tcHV0ZXIgRWR1Y2F0aW9uIChLTVVUTkIp!5e0!3m2!1sth!2sth!4v1763697899572!5m2!1sth!2sth"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </section>
              </div>
            </article>
          </div>
        </section>
      </main>


    </div>
  );
}
