import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <Image 
            src="/logo.svg" 
            alt="" 
            width={100} 
            height={100} 
        />
        <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">Mecat</h1>
            <p className="text-muted-foreground text-base max-w-sm">
                AI-powered investment marketplace — connecting founders with the right investors.
            </p>
        </div>
        <div className="flex gap-3">
            <Button asChild size="lg">
                <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
                <Link href="/auth/register">Register your business</Link>
            </Button>
        </div>
    </main>
  );
}