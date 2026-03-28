'use client';

import { useToggleSet } from '@/hooks/use-toggle-set';
import { useCallback } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Label } from '@/components/atoms/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/molecules/popover';
import { useRoles } from '@/hooks/use-users';

interface RoleMultiSelectProps {
  selectedIds: string[];
  onRoleIdsChange: (ids: string[]) => void;
}

export function RoleMultiSelect({
  selectedIds,
  onRoleIdsChange,
}: RoleMultiSelectProps) {
  const { data: roles } = useRoles();

  const { toggleItem: toggleRole } = useToggleSet<string>(selectedIds, onRoleIdsChange);

  const label =
    selectedIds.length > 0
      ? `Perfil (${selectedIds.length})`
      : 'Perfil';

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="default">
            <Filter className="mr-2 h-4 w-4" />
            {label}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 p-2">
        <div className="flex flex-col gap-1">
          {Array.isArray(roles) &&
            roles.map((role) => (
              <Label
                key={role.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedIds.includes(role.id)}
                  onCheckedChange={() => toggleRole(role.id)}
                />
                <span className="text-sm">{role.name}</span>
              </Label>
            ))}
          {(!roles || (Array.isArray(roles) && roles.length === 0)) && (
            <p className="text-sm text-muted-foreground px-2 py-1.5">
              Nenhum perfil encontrado.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
