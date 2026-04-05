
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import clientPromise from "@/lib/mongodb";
import { redirect } from "@/i18n/navigation";
import ChangePasswordForm from "@/components/admin/profile/ChangePasswordForm";
import TwoFactorSetup from "@/components/admin/profile/TwoFactorSetup";
import NotificationSettingsForm from "@/components/admin/profile/NotificationSettingsForm";

export default async function ProfilePage() {
    const session = await auth();
    // Use username (alias) as primary identifier — email is optional
    const sessionUsername = (session?.user as { role: string; name: string; username: string })?.username;
    if (!session || !sessionUsername) {
        redirect("/ced-portal/login");
    }

    // Fetch latest user data from DB by username (alias)
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const user = await db.collection("users").findOne({ username: sessionUsername });

    if (!user) {
        return <div className="p-6">User not found</div>;
    }

    const t = await getTranslations("Admin.profile");

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>

            {/* Profile Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t("personalInfo")}</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("name")}</label>
                        <div className="text-base text-slate-900 dark:text-slate-100 font-medium">{user.name || session.user.name || "-"}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("username")}</label>
                        <div className="text-base text-[#35622F] dark:text-[#5BA3AD] font-bold">
                            {user.username || "-"}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("role")}</label>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 uppercase">
                            {user.role}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("status")}</label>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive !== false ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"}`}>
                            {user.isActive !== false ? t("statusActive") : t("statusInactive")}
                        </div>
                    </div>
                </div>
            </div>


            {/* Change Password Section */}
            <ChangePasswordForm />

            {/* 2FA Section */}
            <TwoFactorSetup isEnabled={!!user.totpEnabled} />

            {/* Notification Settings Section */}
            <NotificationSettingsForm
                initialEmail={user.notificationEmail || ""}
                initialEnabled={!!user.notificationEnabled}
            />
        </div>
    );
}
