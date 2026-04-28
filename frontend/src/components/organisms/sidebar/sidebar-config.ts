import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BookOpen,
  Tag,
  Globe,
  Archive,
  PackagePlus,
  PackageMinus,
  Boxes,
  Store,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Livros',
    href: '/books',
    icon: BookOpen,
  },
  {
    label: 'Estoques',
    href: '/estoques',
    icon: Boxes,
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
    label: 'Canais de Venda',
    href: '/canais-venda',
    icon: Store,
  },
  {
    label: 'Formas de Pagamento',
    href: '/formas-pagamento',
    icon: CreditCard,
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
