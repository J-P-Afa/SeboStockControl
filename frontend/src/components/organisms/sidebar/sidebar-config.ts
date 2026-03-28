import { Users, ShieldCheck, BookOpen, Tag, Globe, Archive, PackagePlus, PackageMinus, type LucideIcon } from 'lucide-react';

export interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: 'Livros',
    href: '/books',
    icon: BookOpen,
  },
  {
    label: 'Entradas',
    href: '/entradas',
    icon: PackagePlus,
  },
  {
    label: 'Saídas',
    href: '/saidas/registrar',
    icon: PackageMinus,
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
];
