
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";
import ChangePasswordForm from "@/components/admin/profile/ChangePasswordForm";
import TwoFactorSetup from "@/components/admin/profile/TwoFactorSetup";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect("/admin/login");
    }

    // Fetch latest user data from DB (in case session is stale)
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const user = await db.collection("users").findOne({ email: session.user.email });

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
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("email")}</label>
                        <div className="text-base text-slate-900 dark:text-slate-100 font-medium">{user.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("role")}</label>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 uppercase">
                            {user.role}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t("status")}</label>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            Active
                        </div>
                    </div>
                </div>
            </div>


            {/* Change Password Section */}
            <ChangePasswordForm />

            {/* 2FA Section */}
            <TwoFactorSetup isEnabled={!!user.totpEnabled} />
        </div>
    );
}
