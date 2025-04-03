import React from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function Heading({
  as: Component = 'h2',
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Component
      className={cn(
        'font-heading tracking-tight text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function Text({ className, children, ...props }: TextProps) {
  return (
    <p
      className={cn('leading-7 text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
} 