import { Users, ShieldCheck, BookOpen, Tag, Globe, Archive, type LucideIcon } from 'lucide-react';

export interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: 'Usuários',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Perfis',
    href: '/roles',
    icon: ShieldCheck,
  },
  {
    label: 'Livros',
    href: '/books',
    icon: BookOpen,
  },
  {
    label: 'Gêneros',
    href: '/genres',
    icon: Tag,
  },
  {
    label: 'Idiomas',
    href: '/languages',
    icon: Globe,
  },
  {
    label: 'Editoras',
    href: '/publishers',
    icon: Archive,
  },
];
