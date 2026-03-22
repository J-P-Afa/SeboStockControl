'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/components/organisms/sidebar/sidebar-config';

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
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? pathname === item.href : false;

  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300',
            'hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/5',
            !isExpanded && 'justify-center',
          )}
          style={{ paddingLeft: isExpanded ? `${12 + depth * 16}px` : undefined }}
        >
          <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110")} />
          {isExpanded && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform opacity-50',
                  isOpen && 'rotate-180 opacity-100',
                )}
              />
            </>
          )}
        </button>
        {isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <SidebarItem
                key={child.label}
                item={child}
                isExpanded={isExpanded}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
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
