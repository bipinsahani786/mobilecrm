import React, { useState } from 'react';
import { Mail, MessageSquare, Plus, Search, Smartphone, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useTemplates, useDeleteTemplate, type TemplateRecord } from '../api/useTemplates';
import { TemplateFormModal } from '../components/TemplateFormModal';
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [search, setSearch] = useState('');
  
  const { data: templates = [], isLoading } = useTemplates(activeTab === 'all' ? undefined : activeTab);
  const deleteTemplate = useDeleteTemplate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRecord | null>(null);

  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (t: TemplateRecord) => {
    setSelectedTemplate(t);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      {/* Header */}
      <PageHeader
        icon={MessageSquare}
        title="Message Templates"
        subtitle="Manage reusable templates for Email and WhatsApp marketing."
        actions={
          <Button 
            size="sm"
            onClick={handleCreate}
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tabs & Search */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative z-10">
          <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-black/40 p-1.5 rounded-xl w-full md:w-auto">
            {[
              { id: 'all', label: 'All Templates' },
              { id: 'email', label: 'Emails', icon: Mail },
              { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none justify-center",
                  activeTab === tab.id
                    ? "bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-white/5 animate-pulse rounded-2xl" />
            ))
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No templates found</h3>
              <p className="text-slate-500 mt-1">Create your first template to start sending bulk messages.</p>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div 
                key={template.id}
                className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all group flex flex-col"
              >
                <div className="p-5 flex items-start justify-between border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      template.type === 'email' ? "bg-blue-50 text-blue-500 dark:bg-blue-500/10" : 
                      template.type === 'whatsapp' ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10" :
                      "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10"
                    )}>
                      {template.type === 'email' ? <Mail className="w-5 h-5" /> : 
                       template.type === 'whatsapp' ? <MessageSquare className="w-5 h-5" /> : 
                       <Smartphone className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-primary-500 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                        {template.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(template)}
                      className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 bg-slate-50/50 dark:bg-black/20">
                  {template.subject && (
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2 truncate">
                      Sub: {template.subject}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                    {template.body}
                  </p>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#111115] flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Created {format(new Date(template.created_at), 'MMM d, yyyy')}</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md text-slate-600 dark:text-slate-400">
                    {template.type === 'email' ? 'Email Template' : 'WA Template'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TemplateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
      />
    </div>
  );
}
