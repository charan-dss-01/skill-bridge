"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "motion/react";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full overflow-hidden px-4 pb-12 pt-36 md:pb-16 md:pt-48">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-20 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl md:h-64 md:w-64" />
        <div className="absolute -right-10 top-1/3 h-36 w-36 rounded-full bg-indigo-400/25 blur-3xl md:h-56 md:w-56" />
        <div className="absolute left-1/3 top-10 h-24 w-24 rounded-full bg-fuchsia-400/20 blur-2xl md:h-36 md:w-36" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.21, 1, 0.34, 1] }}
          className="space-y-7 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="mx-auto inline-flex rounded-full border border-cyan-200/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 lg:mx-0"
          >
            Career Achievement
          </motion.div>

          <h1 className="gradient-title animate-gradient text-5xl font-bold drop-shadow-[0_8px_35px_rgba(56,189,248,0.35)] md:text-6xl lg:text-7xl xl:text-8xl">
            Your Digital Mentor for
            <br />
            Career Achievement
          </h1>
          <p className="mx-auto max-w-[720px] leading-relaxed text-slate-200 md:text-xl lg:mx-0">
            Accelerate your career with tailored coaching, interview mastery,
            and intelligent tools designed for job success.
          </p>

          <div className="flex justify-center lg:justify-start">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group px-8 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-400/40"
              >
                Get Started
              </Button>
            </Link>
          </div>

          <div className="mx-auto grid max-w-md grid-cols-2 gap-3 lg:mx-0">
            <div className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-center backdrop-blur-xl lg:text-left">
              <p className="text-xl font-bold text-cyan-200">95%</p>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">
                Success Rate
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-center backdrop-blur-xl lg:text-left">
              <p className="text-xl font-bold text-cyan-200">24/7</p>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">
                AI Support
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.85, delay: 0.08, ease: [0.21, 1, 0.34, 1] }}
          className="hero-image-wrapper relative rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.03] p-3 shadow-[0_30px_80px_-38px_rgba(56,189,248,0.9)] backdrop-blur-2xl md:p-5"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-20 w-20 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_45px_rgba(34,211,238,0.3)] animate-[float-soft_8s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full border border-indigo-300/30 bg-indigo-300/15 shadow-[0_0_45px_rgba(129,140,248,0.35)] animate-[float-soft_7s_ease-in-out_infinite_reverse]" />

          <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/20 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,1),rgba(255,255,255,0.2))]" />

          <div
            ref={imageRef}
            className="hero-image relative overflow-hidden rounded-2xl"
          >
            <div className="pointer-events-none absolute inset-y-0 -left-24 z-20 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[hero-sheen_5s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(34,211,238,0.3),transparent_28%),radial-gradient(circle_at_85%_90%,rgba(129,140,248,0.22),transparent_34%)]" />
            <Image
              src="/hero-premium-mentor.svg"
              width={1280}
              height={720}
              alt="Premium AI career dashboard visual"
              className="mx-auto rounded-2xl border border-white/20 shadow-2xl"
              priority
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="absolute -bottom-5 left-4 rounded-xl border border-white/20 bg-slate-900/70 px-4 py-3 text-xs uppercase tracking-[0.14em] text-slate-200 backdrop-blur-2xl md:left-8"
          >
            Digital Mentor
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
