
"use client";
import { getCsrfToken } from "@/utils/cookie";

import { faSave, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';


function OGPreviewCard({ embedUrl }: { embedUrl: string }) {
    const [og, setOg] = useState<{ title: string; description: string; image: string } | null>(null);
    const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

    useEffect(() => {
        if (!embedUrl) return;
        setStatus('loading');
        setOg(null);
        const controller = new AbortController();
        fetch(`/cedweb/api/public/og-preview?url=${encodeURIComponent(embedUrl)}`, { signal: controller.signal })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => { setOg(data); setStatus('done'); })
            .catch((err) => { if (err?.name !== 'AbortError') setStatus('error'); });
        return () => controller.abort();
    }, [embedUrl]);

    if (!embedUrl) return null;

    return (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            {status === 'loading' && (
                <div className="flex items-center gap-3 p-4 animate-pulse">
                    <div className="h-16 w-16 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                </div>
            )}
            {status === 'error' && (
                <div className="flex items-center gap-2 p-4 text-sm text-slate-400">
                    <span>⚠️</span>
                    <span>ไม่สามารถโหลด Preview ได้ แต่ลิงก์จะยังคงทำงานบนหน้าเว็บครับ</span>
                </div>
            )}
            {status === 'done' && og && (
                <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    {og.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/cedweb/api/public/og-image?url=${encodeURIComponent(og.image)}`} alt={og.title} className="h-20 w-20 shrink-0 rounded-lg object-cover bg-slate-100" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1877F2] uppercase tracking-wide mb-1">Facebook</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">{og.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{og.description}</p>
                    </div>
                </a>
            )}
        </div>
    );
}

import { useRouter } from "@/i18n/navigation";

export default function TrainingPage() {
    const t = useTranslations("Admin.pages.training");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [embeds, setEmbeds] = useState({
        embed1: "",
        embed2: "",
        embed3: ""
    });

    useEffect(() => {
        const fetchEmbeds = async () => {
            try {
                const res = await fetch('/cedweb/api/ced-portal/training-embeds');
                if (res.ok) {
                    const data = await res.json();
                    setEmbeds(data);
                }
            } catch (error) {
                console.error("Failed to fetch training embeds:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchEmbeds();
    }, []);


    const handleChange = (key: string, value: string) => {
        let cleanValue = value;
        // If user pastes the full iframe code, extract the src
        if (value.includes("<iframe") && value.includes("src=")) {
            const srcMatch = value.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
                cleanValue = srcMatch[1];
            }
        }

        // Clean up Facebook Plugin URLs to remove hardcoded width/height
        if (cleanValue.includes("plugins/post.php")) {
            try {
                const urlObj = new URL(cleanValue);
                const href = urlObj.searchParams.get("href");
                if (href) {
                    cleanValue = href; // Revert to the original post URL
                }
            } catch {
                // ignore invalid urls
            }
        }
        setEmbeds(prev => ({ ...prev, [key]: cleanValue }));
    };

    const handleSave = async () => {
        // Validate that ALL 3 embeds are provided
        if (!embeds.embed1 || !embeds.embed2 || !embeds.embed3) {
            Swal.fire({
                icon: 'warning',
                title: t('incompleteTitle'),
                text: t('incompleteText'),
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const result = await Swal.fire({
            title: t("common.saveConfirmTitle"),
            text: t("common.saveConfirmText"),
            icon: "question",
            showCancelButton: true,
            confirmButtonText: t("common.save"),
            cancelButtonText: t("common.cancel"),
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            // Get CSRF Token from cookie
            const csrfToken = getCsrfToken();

            if (!csrfToken) {
                throw new Error("CSRF Token not found");
            }

            const res = await fetch('/cedweb/api/ced-portal/training-embeds', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(embeds)
            });

            if (!res.ok) {
                throw new Error('Failed to update');
            }
            await Swal.fire({
                icon: 'success',
                title: t('saveSuccessTitle'),
                text: t('saveSuccessText'),
                showConfirmButton: false,
                timer: 1500
            });
            router.refresh();
        } catch (error: unknown) {
            console.error("Failed to save embeds:", error);
            const message = error instanceof Error ? error.message : t("somethingWentWrong");
            Swal.fire({
                icon: 'error',
                title: t('errorTitle'),
                text: message,
                confirmButtonColor: '#d33',
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-slate-500">{t("fetching")}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="p-6">
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faGlobe} className="text-primary-main" />
                            {t("fbEmbedTitle")}
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Embed 1 */}
                            <div className="flex flex-col gap-3">
                                <label className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200">
                                    {t("post", { number: 1 })}
                                    <span className="block text-base font-normal text-slate-400 mt-1">{t("postHint")}</span>
                                </label>
                                <input
                                    type="url"
                                    value={embeds.embed1}
                                    onChange={(e) => handleChange('embed1', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main transition-all"
                                    placeholder="https://www.facebook.com/..."
                                />
                                {embeds.embed1 ? <OGPreviewCard embedUrl={embeds.embed1} /> : (
                                    <div className="mt-2 flex items-center justify-center min-h-[80px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <span className="text-sm text-slate-400">{t("previewArea")}</span>
                                    </div>
                                )}
                            </div>

                            {/* Embed 2 */}
                            <div className="flex flex-col gap-3">
                                <label className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200">
                                    {t("post", { number: 2 })}
                                    <span className="block text-base font-normal text-slate-400 mt-1">{t("postHint")}</span>
                                </label>
                                <input
                                    type="url"
                                    value={embeds.embed2}
                                    onChange={(e) => handleChange('embed2', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main transition-all"
                                    placeholder="https://www.facebook.com/..."
                                />
                                {embeds.embed2 ? <OGPreviewCard embedUrl={embeds.embed2} /> : (
                                    <div className="mt-2 flex items-center justify-center min-h-[80px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <span className="text-sm text-slate-400">{t("previewArea")}</span>
                                    </div>
                                )}
                            </div>

                            {/* Embed 3 */}
                            <div className="flex flex-col gap-3">
                                <label className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200">
                                    {t("post", { number: 3 })}
                                    <span className="block text-base font-normal text-slate-400 mt-1">{t("postHint")}</span>
                                </label>
                                <input
                                    type="url"
                                    value={embeds.embed3}
                                    onChange={(e) => handleChange('embed3', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main transition-all"
                                    placeholder="https://www.facebook.com/..."
                                />
                                {embeds.embed3 ? <OGPreviewCard embedUrl={embeds.embed3} /> : (
                                    <div className="mt-2 flex items-center justify-center min-h-[80px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <span className="text-sm text-slate-400">{t("previewArea")}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 py-2.5 rounded-lg bg-primary-main hover:bg-primary-main/80 text-white font-medium shadow-sm hover:shadow transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <FontAwesomeIcon icon={faSave} />
                            {loading ? t("saving") : t("saveChanges")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}