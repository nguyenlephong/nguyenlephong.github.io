import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode
} from "react";
import { cn } from "./cn";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";
type ButtonVariant = "primary" | "outline" | "ghost" | "quiet";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
};

export function Button({
  className,
  variant = "outline",
  size = "md",
  active,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="studio-kit-button"
      data-variant={variant}
      data-size={size}
      data-active={active ? "true" : undefined}
      className={cn(
        "sdk-button",
        `sdk-button--${variant}`,
        `sdk-button--${size}`,
        active && "sdk-button--active",
        className
      )}
      type={type}
      {...props}
    />
  );
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      data-slot="studio-kit-badge"
      data-tone={tone}
      className={cn("sdk-badge", `sdk-badge--${tone}`, className)}
      {...props}
    />
  );
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  compact?: boolean;
};

export function Card({ className, tone = "neutral", compact, ...props }: CardProps) {
  return (
    <div
      data-slot="studio-kit-card"
      data-tone={tone}
      data-compact={compact ? "true" : undefined}
      className={cn("sdk-card", `sdk-card--${tone}`, compact && "sdk-card--compact", className)}
      {...props}
    />
  );
}

type ActionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function ActionCard({ className, active, type = "button", ...props }: ActionCardProps) {
  return (
    <button
      data-slot="studio-kit-action-card"
      data-active={active ? "true" : undefined}
      className={cn("sdk-card", "sdk-action-card", active && "sdk-action-card--active", className)}
      type={type}
      {...props}
    />
  );
}

type CardLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function CardLink({ className, ...props }: CardLinkProps) {
  return (
    <a
      data-slot="studio-kit-card-link"
      className={cn("sdk-card", "sdk-card-link", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="studio-kit-card-header" className={cn("sdk-card__header", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 data-slot="studio-kit-card-title" className={cn("sdk-card__title", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="studio-kit-card-description"
      className={cn("sdk-card__description", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="studio-kit-card-content" className={cn("sdk-card__content", className)} {...props} />;
}

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div data-slot="studio-kit-empty" className={cn("sdk-empty", className)} {...props}>
      <div className="sdk-empty__content">
        {icon && <div className="sdk-empty__icon">{icon}</div>}
        <strong>{title}</strong>
        <p>{description}</p>
        {action}
      </div>
    </div>
  );
}

export function ItemGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="studio-kit-item-group" className={cn("sdk-item-group", className)} role="list" {...props} />;
}

export function Item({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="studio-kit-item" className={cn("sdk-item", className)} role="listitem" {...props} />;
}

export function ItemMedia({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span data-slot="studio-kit-item-media" className={cn("sdk-item__media", className)} {...props} />;
}

export function ItemContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="studio-kit-item-content" className={cn("sdk-item__content", className)} {...props} />;
}

