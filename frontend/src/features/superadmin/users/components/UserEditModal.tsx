import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DynamicForm } from '@/components/ui/dynamic-form';
import { toast } from 'sonner';
import { useUpdateUser, useCreateUser, type UserRecord, type RoleRecord } from '../api/useUsers';
import type { FormSectionConfig } from '@/components/ui/dynamic-form';

const userEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  role: z.string().optional(),
});

type UserEditValues = z.infer<typeof userEditSchema>;

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
  roles: RoleRecord[];
}

export function UserFormModal({ isOpen, onClose, user, roles }: UserEditModalProps) {
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();

  const form = useForm<UserEditValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: '',
    },
  });

  const { reset, formState: { isSubmitting } } = form;

  // Build form config dynamically from roles prop
  const formSections = useMemo((): FormSectionConfig[] => {
    const roleOptions = [
      { value: '', label: 'No Role' },
      ...roles.map((r) => ({ value: r.name, label: r.name })),
    ];

    return [
      {
        title: '1. Personal Information',
        fields: [
          {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'John Doe',
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'john@example.com',
          },
          {
            name: 'phone',
            label: 'Phone Number',
            type: 'text',
            placeholder: '+91 9876543210',
          },
          {
            name: 'password',
            label: 'New Password (leave blank to keep)',
            type: 'password',
            placeholder: '••••••••',
          },
        ],
      },
      {
        title: '2. Access & Role',
        fields: [
          {
            name: 'role',
            label: 'Assign Role',
            type: 'select',
            tooltip: 'Select a role for this user.',
            options: roleOptions,
          },
        ],
      },
    ];
  }, [roles]);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          email: user.email || '',
          phone: user.phone || '',
          password: '',
          role: user.roles?.[0]?.name || '',
        });
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: '',
        });
      }
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: UserEditValues) => {
    try {
      const payload: Record<string, any> = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
      };
      if (data.password) {
        payload.password = data.password;
      }
      if (data.role) {
        payload.role = data.role;
      }

      if (user) {
        await updateUser.mutateAsync({ id: user.id, data: payload });
        toast.success('User updated successfully');
      } else {
        if (!data.password) {
          toast.error('Password is required for new users');
          return;
        }
        await createUser.mutateAsync(payload);
        toast.success('User created successfully');
      }
      
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${user ? 'update' : 'create'} user`);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User' : 'Create New User'}
      maxWidth="2xl"
      footer={
        <>
          <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" form="user-edit-form" className="bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 px-6" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {user ? 'Update User' : 'Create User'}
          </Button>
        </>
      }
    >
      <DynamicForm
        id="user-edit-form"
        form={form}
        onSubmit={onSubmit}
        sections={formSections}
      />
    </Modal>
  );
}
