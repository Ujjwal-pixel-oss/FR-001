import type { Metadata } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/700.css";
import "@fontsource/anton";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { FirebaseAuthProvider } from "@/lib/firebase-auth";

export const metadata: Metadata = {
    title: "Jai Shree Balaji Screw House",
    description: "Premium hardware solutions",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <FirebaseAuthProvider>
                    <SmoothScroll>{children}</SmoothScroll>
                </FirebaseAuthProvider>
            </body>
        </html>
    );
}
