import { ReactNode } from "react";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Inter, Kanit } from "next/font/google";
import "@/app/globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import DynamicThemeProvider from "@/components/providers/DynamicThemeProvider"; // [New]
import { Metadata } from "next";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap"
});

const kanit = Kanit({
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["thai", "latin"],
    variable: "--font-kanit",
    display: "swap"
});

export const metadata: Metadata = {
    title: "CED Admin Panel",
    icons: {
        icon: "/images/logo/logo_2.png",
        shortcut: "/images/logo/logo_2.png",
        apple: "/images/logo/logo_2.png",
    },
};

export default async function AdminRootLayout({
    children,
    params
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Set the locale for the request
    setRequestLocale(locale);

    // Load messages for the locale
    const messages = await getMessages({ locale });

    return (
        <html lang={locale} suppressHydrationWarning={true} className={`${inter.variable} ${kanit.variable}`}>
            <body className="bg-slate-50 min-h-screen font-sans" suppressHydrationWarning={true}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <NextAuthProvider>
                            <DynamicThemeProvider>
                                {children}
                            </DynamicThemeProvider>
                        </NextAuthProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
