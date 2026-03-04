import type { Metadata } from "next";
import "@/app/globals.css";
import { Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Mecat",
  description:
    "AI powered investment marketplace connecting investors with vetted business and end-to-end guarantees for secure investments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`bg-background antialiased min-h-screen ${lato.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
