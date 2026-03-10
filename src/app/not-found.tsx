"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        Halaman yang kamu cari tidak ada atau sudah dipindah.
      </p>
      <Button onClick={() => router.back()}>Kembali</Button>
    </div>
  );
}
