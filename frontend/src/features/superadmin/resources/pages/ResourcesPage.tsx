import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileStack, Plus, Trash2, Edit2, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { usePartnerResources, useDeletePartnerResource, type PartnerResource } from '../api/useResources';
import { ResourceFormModal } from '../components/ResourceFormModal';
import { formatBytes } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { toast } from 'sonner';

export default function ResourcesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<PartnerResource | undefined>();
  const { data, isLoading } = usePartnerResources();
  const deleteMutation = useDeletePartnerResource();

  const resources = data?.data || [];

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this asset? It will be removed for all partners.')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Asset deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete asset');
      }
    }
  };

  const getFileIcon = (type: string | null) => {
    if (!type) return <FileText className="w-5 h-5 text-slate-400" />;
    const t = type.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(t)) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (['pdf'].includes(t)) return <FileText className="w-5 h-5 text-red-500" />;
    if (['ppt', 'pptx'].includes(t)) return <FileStack className="w-5 h-5 text-orange-500" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const columns: ColumnDef<PartnerResource>[] = useMemo(() => [
    {
      accessorKey: 'title', header: 'Title', cell: (row) => (
        <div>
          {row.public_url ? (
            <a href={row.public_url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400 block transition-colors">
              {row.title}
            </a>
          ) : (
            <span className="font-bold text-slate-800 dark:text-white block">{row.title}</span>
          )}
          <span className="text-xs text-slate-500 truncate max-w-[300px] block">{row.description || 'No description'}</span>
        </div>
      )
    },
    {
      accessorKey: 'file_type', header: 'Type & Size', cell: (row) => (
        <div className="flex items-center gap-3">
          {row.public_url ? (
            <a href={row.public_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              {getFileIcon(row.file_type)}
            </a>
          ) : (
            getFileIcon(row.file_type)
          )}
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase block leading-none">{row.file_type || 'FILE'}</span>
            <span className="text-xs text-slate-500">{formatBytes(row.file_size)}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'is_active', header: 'Visibility', cell: (row) => (
        <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
      )
    },
    {
      accessorKey: 'created_at', header: 'Uploaded On', cell: (row) => (
        <span className="text-sm text-slate-500">{new Date(row.created_at).toLocaleDateString('en-IN')}</span>
      )
    },
    {
      header: '', cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingResource(row);
              setIsModalOpen(true);
            }}
            className="h-8 w-8 p-0 text-slate-500 hover:text-primary-600"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  ], [deleteMutation.isPending]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={FileStack}
        title="Marketing Assets"
        subtitle="Manage PPTs, PDFs, and resources for your sales partners"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditingResource(undefined);
              setIsModalOpen(true);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold rounded-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Asset
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <DataTable
          data={resources}
          columns={columns}
          isLoading={isLoading}
          searchable={true}
          searchKeys={['title', 'description']}
          searchPlaceholder="Search resources by title or description..."
          emptyIcon={<FileStack className="w-12 h-12 text-slate-400" />}
          emptyMessage="No marketing assets uploaded yet."
          loadingSkeleton={<TableSkeleton rows={5} cols={5} />}
        />
      </div>

      <ResourceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resource={editingResource}
      />
    </div>
  );
}
