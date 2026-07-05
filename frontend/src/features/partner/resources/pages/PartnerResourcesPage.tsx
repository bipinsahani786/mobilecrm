import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileStack, Download, FileText, Image as ImageIcon, Search } from 'lucide-react';
import { usePartnerResources, type PartnerResource } from '../api/usePartnerResources';
import { formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function PartnerResourcesPage() {
  const { data, isLoading } = usePartnerResources();
  const [search, setSearch] = useState('');

  const resources = data?.data || [];

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (type: string | null) => {
    if (!type) return <FileText className="w-7 h-7 text-slate-400" />;
    const t = type.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(t)) return <ImageIcon className="w-7 h-7 text-blue-500" />;
    if (['pdf'].includes(t)) return <FileText className="w-7 h-7 text-red-500" />;
    if (['ppt', 'pptx'].includes(t)) return <FileStack className="w-7 h-7 text-orange-500" />;
    return <FileText className="w-7 h-7 text-slate-400" />;
  };

  const handleDownload = async (resource: PartnerResource) => {
    try {
      const response = await api.get(`/partner/resources/${resource.id}/download`, {
        responseType: 'blob', // Important for downloading files
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resource.title}.${resource.file_type || 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download the file. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={FileStack}
        title="Marketing Assets"
        subtitle="Download PPTs, PDFs, and sales materials to help you pitch."
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-200 dark:bg-white/5 animate-pulse h-48 rounded-2xl w-full"></div>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <FileStack className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No assets found</h3>
            <p className="text-slate-500 max-w-sm">
              {search ? 'We couldn\'t find any assets matching your search.' : 'There are no marketing assets available for download right now.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="group bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-primary-500/30 transition-all duration-300 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                
                <div className="flex items-start gap-4 mb-3">
                  <div className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl shrink-0 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
                    {getFileIcon(resource.file_type)}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors mb-1.5" title={resource.title}>
                      {resource.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                        {resource.file_type || 'FILE'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{formatBytes(resource.file_size)}</span>
                    </div>
                  </div>
                </div>
                
                {resource.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-grow leading-relaxed">
                    {resource.description}
                  </p>
                )}
                
                {!resource.description && <div className="flex-grow min-h-[1rem]"></div>}

                <div className="pt-4 mt-auto">
                  <Button 
                    onClick={() => handleDownload(resource)}
                    className="w-full bg-slate-900 hover:bg-primary-500 text-white dark:bg-white/10 dark:hover:bg-primary-500 transition-all shadow-sm rounded-xl h-11 font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Asset
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
