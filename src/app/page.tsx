import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/app/components/navbar";
import { SectionReveal } from "@/app/components/section-reveal";

export default function LandingPage() {
  return (
    <main id="hero" className="flex scroll-smooth flex-col gap-12 overflow-hidden bg-white text-foreground">
      <Navbar />
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <SectionReveal className="mx-auto max-w-5xl text-center" y={22}>
          <div className="mb-10 flex justify-center">
            <Image
              src="/logo.svg"
              alt="Mecat Logo"
              width={100}
              height={100}
              className="opacity-90 shadow-xl"
            />
          </div>

          <h1 className="flex flex-col gap-2 text-5xl sm:text-6xl">
            Get your business funded
            <span className="text-muted-foreground/40 font-medium">
              with AI-powered pitching
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-foreground/80">
            Mecat helps founders scale and bring their business to reality by
            providing a fair funding and connection platform to investors
          </p>

          <div className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              variant="secondary"
              className="h-10 text-md font-medium px-8"
            >
              <Link
                href="/auth/register"
                className="text-foreground/60 hover:text-foreground"
              >
                Go Pitch
              </Link>
            </Button>
            <Button asChild className="h-10 text-md font-medium px-8">
              <Link
                href="/auth/register"
                className="text-background hover:text-white"
              >
                Go Invest
              </Link>
            </Button>
          </div>
        </SectionReveal>
      </section>
      <div className="relative flex flex-col">
        <div className="absolute top-0 left-[calc(6%-8px)] h-full w-px bg-border/80" />
        <div className="absolute top-0 right-[calc(6%-8px)] h-full w-px bg-border/80" />

        <SectionBox id="problem" className="hide-left-border hide-right-border">
          <SectionReveal className="flex flex-col gap-8 text-foreground/80">
            <p className="font-medium text-4xl max-w-2xl">
              Most businesses with{" "}
              <span className="text-primary">real impact</span> never get the
              funding they deserve
            </p>

            <p className="mt-4 text-lg leading-relaxed max-w-3xl">
              Southeast Asia is home to more than{" "}
              <span className="text-primary">70 million SMEs</span>, representing
              over <span className="text-primary">95% of all businesses</span> in
              the region. Yet many struggle to access funding due to lack of
              investor connections, credit history, or traditional collateral
              requirements.
            </p>

            <p className="mt-4 text-lg leading-relaxed max-w-4xl">
              The result is a massive{" "}
              <span className="text-primary">$300+ billion funding gap</span> for
              small and medium businesses in Southeast Asia, despite contributing
              around <span className="text-primary">42% of the region’s GDP</span>.
              Many founders rely on personal savings or family funding instead of
              professional investors.
            </p>

            <p className="mt-4 text-lg leading-relaxed max-w-5xl">
              This gap is even more critical for startups aligned with the{" "}
              <span className="text-primary">UN Sustainable Development Goals (SDGs)</span>, 
              where impactful innovation often struggles to attract capital and
              visibility.
            </p>
          </SectionReveal>
        </SectionBox>
        <SectionBox id="solution" className="-mt-10 hide-top-border hide-left-border hide-right-border">
          <SectionReveal className="flex flex-col items-end gap-8 text-right text-foreground/80">
            <p className="font-medium text-4xl max-w-2xl">
              How <span className="text-primary">Mecat</span> solves the funding
              gap
            </p>

            <p className="mt-4 text-lg leading-relaxed max-w-3xl ml-auto">
              Mecat empowers founders to present their ideas clearly and connect
              with the right investors through an AI-powered pitching platform
              designed to reduce barriers in early-stage fundraising.
            </p>

            <p className="mt-4 text-lg leading-relaxed max-w-4xl ml-auto">
              Instead of relying on existing networks or traditional funding
              channels, founders can use{" "}
              <span className="text-primary">AI-assisted pitch voice</span>,
              structured business insights, and intelligent matching to reach
              investors actively looking for impactful businesses.
            </p>

            <p className="mt-4 text-lg leading-relaxed max-w-5xl ml-auto">
              By simplifying how MSMEs communicate their vision and enabling{" "}
              <span className="text-primary">fair discovery between founders and investors</span>, 
              Mecat helps unlock opportunities for businesses that would otherwise remain
              invisible in the traditional funding ecosystem.
            </p>
          </SectionReveal>
        </SectionBox>
        
        <SectionBox id="features" className="-mt-10 pb-20 hide-top-border hide-left-border hide-right-border">
          <SectionReveal className="relative mt-6 overflow-hidden">
            <div className="hidden md:block absolute inset-y-0 left-1/3 w-px bg-border/80" />
            <div className="hidden md:block absolute inset-y-0 left-2/3 w-px bg-border/80" />

            <div className="grid md:grid-cols-3">
              <SectionReveal className="px-8 py-14 text-foreground/80" delay={0.05}>
                <h3 className="text-2xl">Meet <span className="text-primary font-semibold">Pitcher</span></h3>
                <p className="mt-4 leading-relaxed">Deliver your business proposition with AI voice pitcher, any investors can ask about your business</p>
              </SectionReveal>

              <SectionReveal className="border-t border-border/80 px-8 py-14 text-foreground/80 md:border-t-0" delay={0.12}>
                <h3 className="text-2xl">Deliver <span className="text-primary font-semibold">Knowledge</span></h3>
                <p className="mt-4 leading-relaxed">Create any knowledge about your business to help AI understand your business and investors in ease</p>
              </SectionReveal>

              <SectionReveal className="border-t border-border/80 px-8 py-14 text-foreground/80 md:border-t-0" delay={0.2}>
                <h3 className="text-2xl">AI <span className="text-primary font-semibold">Legal Help</span></h3>
                <p className="mt-4 leading-relaxed">Our AI will analyze your contract agreement from MoU, NDA, SHA, SAFE, Term Sheet, etc.</p>
              </SectionReveal>
            </div>
          </SectionReveal>
        </SectionBox>

      </div>

      <section id="cta" className="px-6 pt-8 sm:px-10 lg:px-14 scroll-mt-28">
        <SectionReveal className="mx-auto w-full max-w-5xl border border-border/80 bg-muted/30 px-8 py-14 text-center sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            ready to get started
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Join Mecat and start your funding journey today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/70">
            Create your account in minutes, publish your business profile, and connect with investors using AI-powered workflows.
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:w-auto sm:flex-row">
            <Button asChild variant="secondary" className="h-11 w-full px-8 sm:w-auto">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="h-11 w-full px-8 sm:w-auto">
              <Link href="/auth/register">Sign up</Link>
            </Button>
          </div>
        </SectionReveal>
      </section>

      <footer className="mt-2 border-t border-border/80 px-6 pb-16 pt-12 sm:px-10 lg:px-14">
        <SectionReveal className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[1.1fr_1fr_1fr_1fr]" y={20}>
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/logo.svg" alt="Mecat Logo" width={32} height={32} className="rounded-md" />
              <span className="text-lg font-semibold tracking-tight text-foreground">Mecat</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground/70">
              AI-powered platform that helps founders and investors connect, evaluate, and move funding decisions forward.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              { label: "Verification", href: "/dashboard" },
              { label: "AI Interview", href: "/home" },
              { label: "Knowledge Base", href: "/dashboard/ai-configuration" },
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "/" },
              { label: "Contact", href: "/" },
              { label: "Careers", href: "/" },
            ]}
          />

          <FooterColumn
            title="Resources"
            links={[
              { label: "Privacy", href: "/" },
              { label: "Terms", href: "/" },
              { label: "Help Center", href: "/" },
            ]}
          />
        </SectionReveal>

        <SectionReveal className="mx-auto mt-10 w-full max-w-5xl border-t border-border/80 pt-5 text-xs text-foreground/60" delay={0.06} y={12}>
          © {new Date().getFullYear()} Mecat. All rights reserved.
        </SectionReveal>
      </footer>
    </main>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((item) => (
          <li key={`${title}-${item.label}`}>
            <Link
              href={item.href}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionBox({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative flex scroll-mt-28 justify-center px-[6%] ${className ?? ""}`}
    >
      <div className="relative w-full max-w-5xl">
        <div className="pointer-events-none absolute inset-0">
          {/* Top */}
          {!className?.includes("hide-top-border") && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-px bg-border/80" />
          )}
          {/* Bottom */}
          {!className?.includes("hide-bottom-border") && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-px bg-border/80" />
          )}
          {/* Left */}
          {!className?.includes("hide-left-border") && (
            <div className="absolute top-0 -left-8 h-full w-px bg-border/80" />
          )}
          {/* Right */}
          {!className?.includes("hide-right-border") && (
            <div className="absolute top-0 -right-8 h-full w-px bg-border/80" />
          )}
        </div>

        <div className="relative py-16">{children}</div>
      </div>
    </section>
  );
}