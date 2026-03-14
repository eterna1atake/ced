"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faGlobe, faEnvelope, faPhone, faLocationDot, faPalette } from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const t = useTranslations("Admin.pages.settings");
    const tCommon = useTranslations("Admin.forms.common");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        contactDepartmentTh: "ภาควิชาคอมพิวเตอร์ศึกษา ชั้น 2 คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
        contactDepartmentEn: "Department of Computer Education, 2nd Floor, Faculty of Technical Education, King Mongkut's University of Technology North Bangkok",
        contactEmail: "ced@kmutnb.ac.th",
        phoneNumber: "02-555-2000",
        addressTh: "1518 ถ.ประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800",
        addressEn: "1518 Pracharat 1 Road, Wongsawang, Bangsue, Bangkok 10800",
        facebook: "https://www.facebook.com/CEDKMUTNB",
        youtube: "https://www.youtube.com/@departmentofcomputereducat9967",
        tiktok: "https://www.tiktok.com/@computereducation_kmutnb",
        googlePlus: "mailto:ced@fte.kmutnb.ac.th",
        theme: "default",
        theme_start_date: "",
        theme_end_date: "",
        theme_force_disable_snow: false
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleClearError = (name: string) => {
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!settings.contactDepartmentTh) newErrors.contactDepartmentTh = tCommon("required");
        if (!settings.contactDepartmentEn) newErrors.contactDepartmentEn = tCommon("required");
        if (!settings.contactEmail) newErrors.contactEmail = tCommon("required");
        if (!settings.phoneNumber) newErrors.phoneNumber = tCommon("required");
        if (!settings.addressTh) newErrors.addressTh = tCommon("required");
        if (!settings.addressEn) newErrors.addressEn = tCommon("required");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        handleClearError(key);
    };

    const handleSave = async () => {
        if (!validate()) {
            Swal.fire({
                title: tCommon("missingInfoTitle"),
                text: tCommon("missingInfoText"),
                icon: "error",
                confirmButtonColor: "#f43f5e",
            });
            return;
        }

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

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(settings)
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Server error:", data);
                throw new Error(data.error || 'Failed to update');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Settings saved successfully!',
                showConfirmButton: false,
                timer: 1500
            });
            router.refresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Failed to save settings:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error saving settings: ${error.message}`,
                confirmButtonColor: '#d33'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 overflow-hidden">
                <div className="p-6 space-y-8">
                    {/* Appearance / Theme */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faPalette} className="text-primary-main" />
                            Appearance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seasonal Theme</label>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => handleChange('theme', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                >
                                    <option value="default">Default</option>
                                    <option value="christmas">Christmas (Snow & Red/Green)</option>
                                    <option value="grayscale">Grayscale (Black & White)</option>
                                </select>
                            </div>

                            {/* Theme Advanced Settings */}
                            {settings.theme !== 'default' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={settings.theme_start_date}
                                            onChange={(e) => handleChange('theme_start_date', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={settings.theme_end_date}
                                            onChange={(e) => handleChange('theme_end_date', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.theme_force_disable_snow}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                onChange={(e) => setSettings(prev => ({ ...prev, theme_force_disable_snow: e.target.checked as any }))}
                                                className="w-4 h-4 text-primary-main rounded border-slate-300 focus:ring-primary-main dark:bg-slate-800ダーク:border-slate-700"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Force Disable Snow Effect (Reduce Performance Impact)</span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800"></div>

                    {/* Site Information */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} className="text-primary-main" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Contact Department (TH) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={settings.contactDepartmentTh}
                                    onChange={(e) => handleChange('contactDepartmentTh', e.target.value)}
                                    onFocus={() => handleClearError('contactDepartmentTh')}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.contactDepartmentTh ? 'border-red-500 animate-shake' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all`}
                                />
                                {errors.contactDepartmentTh && <p className="mt-1 text-xs text-red-500">{errors.contactDepartmentTh}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Contact Department (EN) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={settings.contactDepartmentEn}
                                    onChange={(e) => handleChange('contactDepartmentEn', e.target.value)}
                                    onFocus={() => handleClearError('contactDepartmentEn')}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.contactDepartmentEn ? 'border-red-500 animate-shake' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all`}
                                />
                                {errors.contactDepartmentEn && <p className="mt-1 text-xs text-red-500">{errors.contactDepartmentEn}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Contact Information */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Contact Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400"><FontAwesomeIcon icon={faEnvelope} /></span>
                                    <input
                                        type="email"
                                        value={settings.contactEmail}
                                        onChange={(e) => handleChange('contactEmail', e.target.value)}
                                        onFocus={() => handleClearError('contactEmail')}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.contactEmail ? 'border-red-500 animate-shake' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400"><FontAwesomeIcon icon={faPhone} /></span>
                                    <input
                                        type="tel"
                                        value={settings.phoneNumber}
                                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                        onFocus={() => handleClearError('phoneNumber')}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.phoneNumber ? 'border-red-500 animate-shake' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Address (TH) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400"><FontAwesomeIcon icon={faLocationDot} /></span>
                                    <textarea
                                        rows={3}
                                        value={settings.addressTh}
                                        onChange={(e) => handleChange('addressTh', e.target.value)}
                                        onFocus={() => handleClearError('addressTh')}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.addressTh ? 'border-red-500 animate-shake' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all`}
                                    ></textarea>
                                </div>
                                {errors.addressTh && <p className="mt-1 text-xs text-red-500">{errors.addressTh}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Address (EN) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400"><FontAwesomeIcon icon={faLocationDot} /></span>
                                    <textarea
                                        rows={3}
                                        value={settings.addressEn}
                                        onChange={(e) => handleChange('addressEn', e.target.value)}
                                        onFocus={() => handleClearError('addressEn')}
                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${errors.addressEn ? 'border-red-500 animate-shake' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all`}
                                    ></textarea>
                                </div>
                                {errors.addressEn && <p className="mt-1 text-xs text-red-500">{errors.addressEn}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800"></div>

                    {/* Social Media */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faGlobe} className="text-primary-main" />
                            Social Media Links
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facebook</label>
                                <input
                                    type="url"
                                    value={settings.facebook}
                                    onChange={(e) => handleChange('facebook', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">YouTube</label>
                                <input
                                    type="url"
                                    value={settings.youtube}
                                    onChange={(e) => handleChange('youtube', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TikTok</label>
                                <input
                                    type="url"
                                    value={settings.tiktok}
                                    onChange={(e) => handleChange('tiktok', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                    placeholder="https://tiktok.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Link</label>
                                <input
                                    type="text"
                                    value={settings.googlePlus.replace(/^mailto:/, '')}
                                    onChange={(e) => handleChange('googlePlus', `mailto:${e.target.value}`)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all"
                                    placeholder="ced@kmutnb.ac.th"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-slate-100 dark:border-slate-800"></div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button" // Prevent form submission if inside form (though it's not)
                            className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {tCommon("cancel")}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 py-2.5 rounded-lg bg-primary-main hover:bg-primary-main/80 text-white font-medium shadow-sm hover:shadow transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <FontAwesomeIcon icon={faSave} />
                            {loading ? tCommon("saving") : tCommon("saveChanges")}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
}
