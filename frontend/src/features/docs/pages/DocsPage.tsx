import React, { useState } from 'react';
import { BookOpen, Search, Monitor, Store, Users, LayoutDashboard, Globe } from 'lucide-react';
import { docsData, type Language } from '../data/docsContent';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Helper to get lucide icon by string name
const getIcon = (name: string) => {
  switch (name) {
    case 'LayoutDashboard': return <LayoutDashboard className="w-5 h-5" />;
    case 'Monitor': return <Monitor className="w-5 h-5" />;
    case 'Store': return <Store className="w-5 h-5" />;
    case 'Users': return <Users className="w-5 h-5" />;
    default: return <BookOpen className="w-5 h-5" />;
  }
};

export default function DocsPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [activeSectionId, setActiveSectionId] = useState<string>(docsData[0].id);

  const activeSection = docsData.find(s => s.id === activeSectionId) || docsData[0];

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm sticky top-24">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-widest uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                Help & Docs
              </h2>
            </div>
            <div className="p-2 space-y-1">
              {docsData.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left",
                    activeSectionId === section.id
                      ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    activeSectionId === section.id ? "bg-white dark:bg-primary-500/20 shadow-sm" : ""
                  )}>
                    {getIcon(section.icon)}
                  </div>
                  <span className="flex-1 truncate">{section.title[lang]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-white/5 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
              <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                  {getIcon(activeSection.icon)}
                </div>
                {activeSection.title[lang]}
              </h1>

              {/* Language Switcher */}
              <div className="flex items-center bg-slate-200/50 dark:bg-black/30 rounded-xl p-1 shadow-inner shrink-0">
                <Globe className="w-4 h-4 text-slate-400 ml-2 mr-1" />
                <button
                  onClick={() => setLang('en')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300",
                    lang === 'en' 
                      ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-white shadow" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('hi')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300",
                    lang === 'hi' 
                      ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-white shadow" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-h3:text-primary-600 dark:prose-h3:text-primary-400 prose-a:text-blue-500 prose-strong:text-slate-800 dark:prose-strong:text-slate-200">
              <ReactMarkdown>
                {activeSection.content[lang]}
              </ReactMarkdown>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
