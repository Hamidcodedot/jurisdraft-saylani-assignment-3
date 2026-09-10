import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { TemplateSummary } from '@/lib/api';

interface TemplateCardProps {
  template: TemplateSummary;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-400/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-6">
        
        {/* Top category & badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {template.category}
          </span>
          {template.badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              {template.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug mb-2 font-serif">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {template.description}
        </p>

      </div>

      {/* Footer info & CTA */}
      <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{template.estimated_time || '3 min'}</span>
        </div>

        <Link
          href={`/editor/${template.id}`}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-blue-700 transition"
        >
          <span>Draft Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
