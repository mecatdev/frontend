"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate } from "motion";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
	{ label: "Problem", href: "#problem" },
	{ label: "Solution", href: "#solution" },
	{ label: "Features", href: "#features" },
	{ label: "Start", href: "#cta" },
];

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isAnimatingScroll, setIsAnimatingScroll] = useState(false);

	useEffect(() => {
		const onScroll = () => setIsScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const navigateToSection = useCallback((hash: string) => {
		const sectionId = hash.replace("#", "");
		const target = document.getElementById(sectionId);
		if (!target) return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			target.scrollIntoView({ behavior: "auto", block: "start" });
			return;
		}

		const targetY = Math.max(0, window.scrollY + target.getBoundingClientRect().top - 112);
		setIsAnimatingScroll(true);

		animate(window.scrollY, targetY, {
			duration: 0.75,
			ease: [0.22, 1, 0.36, 1],
			onUpdate: (value) => window.scrollTo(0, value),
			onComplete: () => setIsAnimatingScroll(false),
		});
	}, []);

	return (
		<div className="fixed inset-x-0 top-4 z-50 px-4 sm:px-8">
			<motion.nav
				initial={false}
				animate={{
					borderRadius: isScrolled ? 14 : 0,
					y: isScrolled ? 0 : -2,
					scale: isScrolled ? 1 : 0.996,
				}}
				transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
				className={cn(
					"mx-auto flex h-14 items-center justify-between transition-[max-width,padding,background-color,border-color,box-shadow] duration-300",
					isScrolled
						? "max-w-5xl border border-border/80 bg-white/90 px-4 shadow-lg backdrop-blur"
						: "w-full max-w-none border border-transparent bg-transparent px-2 sm:px-4",
				)}
			>
				<Link href="#hero" className="inline-flex items-center gap-2">
					<Image src="/logo.svg" alt="Mecat Logo" width={28} height={28} />
					<span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
						Mecat
					</span>
				</Link>

				<div className="hidden items-center gap-5 md:flex">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							onClick={(event) => {
								event.preventDefault();
								if (!isAnimatingScroll) navigateToSection(item.href);
							}}
							className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
						>
							{item.label}
						</Link>
					))}
				</div>

				<Button asChild size="sm" className="h-9 px-4">
					<Link href="/auth/login">Login</Link>
				</Button>
			</motion.nav>
		</div>
	);
}
