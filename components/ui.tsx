import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...props} />;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary: "bg-accent text-white hover:opacity-90 shadow-glow-sm hover:shadow-glow active:scale-[0.98]",
    secondary: "bg-surface2 text-primary border border-border hover:bg-[#22304a] active:scale-[0.98]",
    ghost: "bg-transparent text-secondary hover:text-primary hover:bg-surface2/50",
    danger: "bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 active:scale-[0.98]",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-3 py-1 text-xs font-medium text-secondary",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none placeholder:text-muted transition-colors focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none placeholder:text-muted transition-colors resize-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
        props.className
      )}
    />
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />;
}

