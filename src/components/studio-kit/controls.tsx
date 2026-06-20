import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./primitives";
import { cn } from "./cn";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  label: string;
  placeholder: string;
  clearLabel: string;
  icon?: ReactNode;
  clearIcon?: ReactNode;
  className?: string;
};

export function SearchField({
  value,
  onChange,
  onClear,
  label,
  placeholder,
  clearLabel,
  icon,
  clearIcon,
  className
}: SearchFieldProps) {
  return (
    <label data-slot="studio-kit-search" className={cn("sdk-search", className)}>
      {icon}
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <Button className="sdk-search__clear" size="icon" variant="ghost" onClick={onClear} aria-label={clearLabel}>
          {clearIcon}
        </Button>
      )}
    </label>
  );
}

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  className,
  options,
  value,
  onChange,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div data-slot="studio-kit-segmented-control" className={cn("sdk-segmented-control", className)} {...props}>
      {options.map((option) => (
        <Button
          key={option.value}
          active={option.value === value}
          className={option.value === value ? "is-active" : ""}
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          variant="quiet"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
