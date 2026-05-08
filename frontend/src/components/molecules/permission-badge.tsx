import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';

interface PermissionBadgeProps {
    action: string;
    label?: string | null;
    className?: string;
}

export function PermissionBadge({ action, label, className }: PermissionBadgeProps) {
    return (
        <Badge
            variant="outline"
            title={action}
            className={cn(
                "bg-foreground/5 backdrop-blur-md border-foreground/10 text-muted-foreground text-[10px] py-0.5 px-2 hover:bg-foreground/10 transition-colors",
                className
            )}
        >
            {label || action}
        </Badge>
    );
}
