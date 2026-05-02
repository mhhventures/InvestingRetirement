import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar-offers";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  stats?: { label: string; value: string }[];
  crumbLabel?: string;
  children: ReactNode;
};

export function CategoryPage({ eyebrow, title, subtitle, stats, crumbLabel, children }: Props) {
  const crumb = crumbLabel || title;
  return (
    <div className="bg-[#fef6f1]">
      <div className="border-b border-[#e4d9cf] bg-[#fef6f1]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] text-black/50 overflow-x-auto">
          <Link to="/" className="hover:text-[#0e4d45]">Home</Link>
          <span className="mx-1 sm:mx-1.5 text-black/30">/</span>
          <span className="text-black font-semibold whitespace-nowrap">{crumb}</span>
        </div>
      </div>
      <section className="border-b border-[#e4d9cf]">
        <div className="max-w-6xl mx-auto px-4 py-7">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e4d45] mb-2">{eyebrow}</div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black leading-[1.05] mb-2">{title}</h1>
          <p className="text-sm text-[#1a1a1a] max-w-3xl leading-relaxed">{subtitle}</p>
          {stats && (
            <div className="mt-5 grid grid-cols-3 gap-2 max-w-lg">
              {stats.map((s) => (
                <div key={s.label} className="bg-white border border-[#e4d9cf] rounded-sm p-3">
                  <div className="font-serif text-xl font-bold text-black">{s.value}</div>
                  <div className="text-[10px] text-[#5a5a5a] uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="min-w-0">{children}</div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
