import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';

interface PermissionBadgeProps {
    action: string;
    className?: string;
}

export function PermissionBadge({ action, className }: PermissionBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "bg-foreground/5 backdrop-blur-md border-foreground/10 text-muted-foreground font-mono text-[10px] uppercase tracking-wider py-0.5 px-2 hover:bg-foreground/10 transition-colors",
                className
            )}
        >
            {action}
        </Badge>
    );
}
