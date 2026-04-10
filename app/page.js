import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  MessageCircleQuestion,
} from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";
import { Boxes } from "@/components/ui/background-boxes";
import Reveal from "@/components/ui/reveal";

export default function LandingPage() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-20 overflow-hidden bg-slate-950">
        <Boxes className="opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.24),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(244,114,182,0.18),transparent_35%),radial-gradient(circle_at_55%_60%,rgba(45,212,191,0.18),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/15 via-slate-950/65 to-slate-950/90" />
      </div>

      <div className="relative z-10">

        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <section className="w-full py-14 md:py-24 lg:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal className="mx-auto mb-12 max-w-4xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Powerful Features for Your Career Growth
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Reveal key={index} delay={index * 0.06}>
                  <Card className="group h-full border border-white/15 bg-white/[0.04] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-300/40 hover:bg-white/[0.08] hover:shadow-[0_18px_45px_-18px_rgba(34,211,238,0.65)]">
                    <CardContent className="pt-7 pb-7 text-center flex h-full flex-col items-center justify-start">
                      <div className="mb-4 rounded-xl border border-white/10 bg-slate-900/50 p-3 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        {feature.icon}
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-slate-100">{feature.title}</h3>
                      <p className="text-slate-300/90">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-10 md:py-16">
          <Reveal className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-5 rounded-3xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-xl md:grid-cols-4 md:p-10">
              <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-white/10 bg-slate-900/45 p-4 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">50+</h3>
                <p className="text-slate-300">Industries Covered</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-white/10 bg-slate-900/45 p-4 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">1000+</h3>
                <p className="text-slate-300">Interview Questions</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-white/10 bg-slate-900/45 p-4 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">95%</h3>
                <p className="text-slate-300">Success Rate</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-white/10 bg-slate-900/45 p-4 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">24/7</h3>
                <p className="text-slate-300">AI Support</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-14 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4 md:text-4xl">How It Works</h2>
              <p className="text-slate-300">
                Four simple steps to accelerate your career growth
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {howItWorks.map((item, index) => (
                <Reveal key={index} delay={index * 0.07}>
                  <div className="group relative flex h-full flex-col items-center rounded-2xl border border-white/15 bg-white/[0.04] p-7 text-center backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-300/50 hover:shadow-[0_22px_48px_-24px_rgba(34,211,238,0.75)]">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-xl text-slate-100">{item.title}</h3>
                    <p className="mt-2 text-slate-300">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-14 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal className="mb-12">
              <h2 className="text-3xl font-bold text-center md:text-4xl">
                What Our Users Say
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonial.map((testimonial, index) => (
                <Reveal key={index} delay={index * 0.08}>
                  <Card className="h-full border border-white/15 bg-white/[0.04] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-300/45 hover:shadow-[0_22px_50px_-28px_rgba(34,211,238,0.82)]">
                    <CardContent className="pt-7">
                      <div className="flex flex-col space-y-4">
                        <div className="mb-4 flex items-center space-x-4">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-cyan-200/35">
                            <Image
                              width={40}
                              height={40}
                              src={testimonial.image}
                              alt={testimonial.author}
                              className="h-full w-full rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">{testimonial.author}</p>
                            <p className="text-sm text-slate-300">
                              {testimonial.role}
                            </p>
                            <p className="text-sm text-cyan-300">
                              {testimonial.company}
                            </p>
                          </div>
                        </div>
                        <blockquote>
                          <p className="relative italic text-slate-200/90">
                            <span className="absolute -left-2 -top-4 text-3xl text-cyan-300">
                              &quot;
                            </span>
                            {testimonial.quote}
                            <span className="absolute -bottom-4 text-3xl text-cyan-300">
                              &quot;
                            </span>
                          </p>
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-14 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <Reveal className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.16),transparent_45%),rgba(15,23,42,0.62)] p-5 shadow-[0_30px_80px_-36px_rgba(34,211,238,0.7)] backdrop-blur-2xl md:p-8">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-200/30 bg-cyan-300/10 text-cyan-200">
                  <MessageCircleQuestion className="h-5 w-5" />
                </div>
                <h2 className="text-3xl font-bold mb-4 md:text-4xl">
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-300">
                  Find answers to common questions about our platform
                </p>
              </div>

              <Accordion type="single" collapsible className="mx-auto w-full max-w-4xl">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="mb-3 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] px-4 transition-all duration-300 data-[state=open]:border-cyan-200/30 data-[state=open]:bg-cyan-300/[0.04] data-[state=open]:shadow-[0_10px_24px_-18px_rgba(34,211,238,0.45)] last:mb-0"
                  >
                    <AccordionTrigger className="py-5 text-left text-base font-semibold text-slate-100 hover:no-underline hover:text-slate-200">
                      <span className="flex items-center gap-3 pr-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-300/8 text-xs font-bold text-cyan-100">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 pl-10 text-slate-300/95 md:text-[15px]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full pb-16 pt-6 md:pb-24 md:pt-12">
          <Reveal className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-cyan-200/16 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.24),transparent_45%),rgba(15,23,42,0.74)] px-6 py-20 shadow-[0_26px_58px_-34px_rgba(56,189,248,0.55)] backdrop-blur-2xl md:px-12">
              <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter text-slate-50 sm:text-4xl md:text-5xl">
                  Ready to Accelerate Your Career?
                </h2>
                <p className="mx-auto max-w-[600px] text-slate-200/85 md:text-xl">
                  Join thousands of professionals who are advancing their careers
                  with AI-powered guidance.
                </p>
                <Link href="/dashboard" passHref>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="group mt-5 h-11 border border-white/22 bg-white/88 text-white-900 transition-all duration-300 hover:border-white/30 hover:bg-white/94"
                  >
                    Start Your Journey Today
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

      </div>
    </div>
  );
}
