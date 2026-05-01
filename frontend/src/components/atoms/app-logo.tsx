import Image from 'next/image';
import { cn } from '@/lib/utils';

type AppLogoProps = {
  className?: string;
  imageClassName?: string;
  markClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'mark' | 'full';
};

const sizeClasses = {
  sm: {
    root: 'h-12 w-full',
    image: 'h-12 w-full max-w-44',
    mark: 'h-10 w-10',
  },
  md: {
    root: 'h-16 w-full',
    image: 'h-16 w-full max-w-56',
    mark: 'h-12 w-12',
  },
  lg: {
    root: 'h-56 w-full',
    image: 'h-56 w-full max-w-80',
    mark: 'h-20 w-20',
  },
};

export function AppLogo({
  className,
  imageClassName,
  markClassName,
  size = 'md',
  variant = 'full',
}: AppLogoProps) {
  const classes = sizeClasses[size];
  const isMark = variant === 'mark';

  return (
    <span
      role="img"
      aria-label="Sebo Alfa"
      className={cn(
        'inline-flex items-center justify-center overflow-hidden',
        isMark ? classes.mark : classes.root,
        className,
      )}
    >
      <Image
        src="/sebo-alfa-logo.png"
        alt=""
        width={1200}
        height={1200}
        loading="eager"
        className={cn(
          'object-contain',
          isMark ? classes.mark : classes.image,
          isMark ? markClassName : imageClassName,
        )}
      />
    </span>
  );
}
