'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/components/organisms/sidebar/sidebar-config';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/molecules/popover';

interface SidebarItemProps {
  item: MenuItem;
  isExpanded: boolean;
  depth?: number;
}

export function SidebarItem({
  item,
  isExpanded,
  depth = 0,
}: SidebarItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? pathname === item.href : false;

  const Icon = item.icon;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  if (hasChildren) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300',
            'hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/5',
            isOpen && 'bg-primary/10 text-primary',
            !isExpanded && 'justify-center',
          )}
          style={{ paddingLeft: isExpanded ? `${12 + depth * 16}px` : undefined }}
        >
          <Icon className={cn("h-4 w-4 shrink-0 transition-transform", !isOpen && "group-hover:scale-110")} />
          {isExpanded && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              <ChevronRight
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform opacity-50',
                )}
              />
            </>
          )}
        </PopoverTrigger>
        <PopoverContent
          side="right"
          sideOffset={12}
          align="start"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="w-56 p-2 flex flex-col gap-1 z-50 bg-sidebar/95 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            {item.label}
          </div>
          {item.children!.map((child) => (
            <SidebarItem
              key={child.label}
              item={child}
              isExpanded={true}
              depth={0}
            />
          ))}
        </PopoverContent>
      </Popover>
    );
  }

  const content = (
    <>
      <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
      {isExpanded && (
        <span className="truncate">{item.label}</span>
      )}
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300',
          'hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/5',
          isActive && 'bg-primary/15 text-primary border-r-2 border-primary rounded-r-none',
          !isExpanded && 'justify-center',
        )}
        style={{ paddingLeft: isExpanded ? `${12 + depth * 16}px` : undefined }}
      >
        {content}
      </Link>
    );
  }


  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
        !isExpanded && 'justify-center',
      )}
      style={{ paddingLeft: isExpanded ? `${12 + depth * 16}px` : undefined }}
    >
      {content}
    </div>
  );
}
