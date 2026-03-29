import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './button';
import { LucidePlus } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'hero', 'glass', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
};

export const Hero: Story = {
  args: {
    children: 'Hero Button',
    variant: 'hero',
    size: 'lg',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete Item',
    variant: 'destructive',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <LucidePlus className="size-4" />
        Add Item
      </>
    ),
    variant: 'default',
  },
};

export const IconOnly: Story = {
  args: {
    children: <LucidePlus className="size-4" />,
    variant: 'outline',
    size: 'icon',
    'aria-label': 'Add',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};
