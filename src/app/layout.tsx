import type { Metadata } from "next";
import "@/app/globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
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
      <body className={`bg-white antialiased min-h-screen ${poppins.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
