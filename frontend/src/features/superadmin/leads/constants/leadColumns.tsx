import type { ColumnDef } from '@/components/ui/data-table';
import type { Lead } from '../api/useLeads';
import { MetaCell, ContactCell, StatusSelectCell } from '@/components/ui/table-cells';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import React from 'react';

interface LeadColumnsProps {
  onStatusChange: (lead: Lead, newStatus: string, e: React.ChangeEvent<HTMLSelectElement>) => void;
  onEdit: (lead: Lead, e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (lead: Lead, e: React.MouseEvent<HTMLButtonElement>) => void;
  isDeleting: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const getLeadColumns = ({
  onStatusChange,
  onEdit,
  onDelete,
  isDeleting
}: LeadColumnsProps): ColumnDef<Lead>[] => [
  {
    header: 'Date',
    accessorKey: 'created_at',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs text-slate-400 whitespace-nowrap',
    cell: (lead) => formatDate(lead.created_at)
  },
  {
    header: 'Business',
    accessorKey: 'business_name',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (lead) => (
      <MetaCell 
        title={lead.business_name}
        contactsCount={lead.contacts_count}
        outcomeStatus={lead.last_contact?.outcome}
      />
    )
  },
  {
    header: 'Contact Person',
    accessorKey: 'contact_person',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (lead) => (
      <ContactCell 
        name={lead.contact_person}
        phone={lead.phone}
        email={lead.email}
      />
    )
  },
  {
    header: 'Partner',
    className: '!px-3 !py-1.5 text-xs',
    cell: (lead) => (
      lead.partner ? (
        <MetaCell 
          title={lead.partner.name}
          subtitle={lead.partner.company_name}
        />
      ) : <span className="text-slate-400 text-xs">—</span>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs text-center w-32',
    cell: (lead) => (
      <StatusSelectCell 
        value={lead.status}
        onChange={(val, e) => onStatusChange(lead, val, e)}
        options={[
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'converted', label: 'Converted' },
          { value: 'lost', label: 'Lost' },
        ]}
      />
    )
  },
  {
    header: 'Actions',
    className: 'text-right !px-3 !py-1.5 text-xs',
    cell: (lead) => (
      <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => onEdit(lead, e)}
          title="Edit Lead"
          className="w-7 h-7 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => onDelete(lead, e)}
          disabled={isDeleting}
          title="Delete Lead"
          className="w-7 h-7 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center rounded-lg p-0 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    )
  }
];
