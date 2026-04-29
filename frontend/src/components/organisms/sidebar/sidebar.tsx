'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { SidebarItem } from '@/components/molecules/sidebar-item';
import { Button } from '@/components/atoms/button';
import { AppLogo } from '@/components/atoms/app-logo';
import { ThemeSwitcher } from '@/components/molecules/theme-switcher';
import { menuItems } from './sidebar-config';
import { Separator } from '@/components/atoms/separator';

/**
 * Organismo: Sidebar (Menu Lateral)
 * 
 * Este componente orquestra a navegação principal da aplicação, 
 * suportando estados de expansão (hover) e integração com autenticação/tema.
 * 
 * @ai-context Utiliza Glassmorphism e animações baseadas em framer-motion/tailwind-transitions.
 * @returns Um elemento <aside> fixo com navegação e controles de perfil.
 */
export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar/80 backdrop-blur-xl border-r border-white/10 dark:border-r-white/5 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] custom-scrollbar',
        isExpanded ? 'w-64' : 'w-16',
      )}
      aria-label="Menu Lateral"
    >
      <div className="flex h-16 items-center gap-3 px-4">
        <AppLogo
          size="sm"
          variant={isExpanded ? 'full' : 'mark'}
          className={cn(!isExpanded && 'justify-center')}
        />
      </div>


      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      <Separator />

      <div className="p-2 space-y-2">
        {user && (
          <>
            {isExpanded && (
              <div className="px-3 pb-1 pt-2">
                <p className="text-xs font-medium text-foreground truncate">
                  {user.email}
                </p>
                <p className="text-[10px] text-primary/80 uppercase tracking-tighter mt-0.5 font-semibold">
                  {user.role}
                </p>
              </div>
            )}
            
            <ThemeSwitcher compact={!isExpanded} className="w-full" />
            
            <Button
              variant="ghost"
              onClick={logout}
              aria-label="Sair da Conta"
              className={cn(
                'w-full hover:bg-destructive/10 hover:text-destructive',
                !isExpanded && 'px-0 justify-center'
              )}
            >
              <LogOut className={cn("shrink-0", isExpanded ? "mr-2 h-4 w-4" : "h-5 w-5")} />
              {isExpanded && <span>Sair</span>}
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
