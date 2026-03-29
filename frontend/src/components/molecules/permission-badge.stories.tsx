import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PermissionBadge } from './permission-badge';

const meta: Meta<typeof PermissionBadge> = {
  title: 'Molecules/PermissionBadge',
  component: PermissionBadge,
  tags: ['autodocs'],
  argTypes: {
    action: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PermissionBadge>;

export const Default: Story = {
  args: {
    action: 'users:read',
  },
};

export const WritePermission: Story = {
  args: {
    action: 'books:write',
  },
};

export const AdminPermission: Story = {
  args: {
    action: 'system:admin',
  },
};
