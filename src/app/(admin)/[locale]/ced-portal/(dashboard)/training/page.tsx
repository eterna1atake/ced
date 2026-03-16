
"use client";

import { faSave, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

const FACEBOOK_EMBED_DEFAULT_WIDTH = 350;
const FACEBOOK_EMBED_DEFAULT_HEIGHT = 620; // Matches public site dimensions

function FacebookPostEmbedPreview({ embedUrl }: { embedUrl: string }) {
    if (!embedUrl) return null;

    let resolvedUrl = embedUrl;
    const width = FACEBOOK_EMBED_DEFAULT_WIDTH;
    const height = FACEBOOK_EMBED_DEFAULT_HEIGHT;

    try {
        let normalizedEmbedUrl = embedUrl;
        if (embedUrl.includes("web.facebook.com")) {
            normalizedEmbedUrl = embedUrl.replace("web.facebook.com", "www.facebook.com");
        }

        const url = new URL(normalizedEmbedUrl);

        if (url.pathname.includes("plugins/post.php")) {
            if (!url.searchParams.has("width")) url.searchParams.set("width", String(width));
            if (!url.searchParams.has("show_text")) url.searchParams.set("show_text", "true");
            resolvedUrl = url.toString();
        } else {
            const pluginUrl = new URL("https://www.facebook.com/plugins/post.php");
            pluginUrl.searchParams.set("href", normalizedEmbedUrl);
            pluginUrl.searchParams.set("width", String(width));
            pluginUrl.searchParams.set("show_text", "true");
            resolvedUrl = pluginUrl.toString();
        }
    } catch { return null; }

    return (
        <iframe
            title="Facebook Preview"
            src={resolvedUrl}
            width={width}
            height={height}
            style={{ border: "none", overflow: "hidden", maxWidth: '100%' }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
    );
}

import { useRouter } from "next/navigation";

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
                const res = await fetch('/api/ced-portal/training-embeds');
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
            const csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("ced_csrf_token="))
                ?.split("=")[1];

            if (!csrfToken) {
                throw new Error("CSRF Token not found");
            }

            const res = await fetch('/api/ced-portal/training-embeds', {
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
                                <div className={`mt-2 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px] transition-all ${embeds.embed1 ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700'}`}>
                                    {embeds.embed1 ? (
                                        <div className="w-full flex justify-center">
                                            <FacebookPostEmbedPreview embedUrl={embeds.embed1} />
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400">{t("previewArea")}</span>
                                    )}
                                </div>
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
                                <div className={`mt-2 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px] transition-all ${embeds.embed2 ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700'}`}>
                                    {embeds.embed2 ? (
                                        <div className="w-full flex justify-center">
                                            <FacebookPostEmbedPreview embedUrl={embeds.embed2} />
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400">{t("previewArea")}</span>
                                    )}
                                </div>
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
                                <div className={`mt-2 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px] transition-all ${embeds.embed3 ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700'}`}>
                                    {embeds.embed3 ? (
                                        <div className="w-full flex justify-center">
                                            <FacebookPostEmbedPreview embedUrl={embeds.embed3} />
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400">{t("previewArea")}</span>
                                    )}
                                </div>
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
