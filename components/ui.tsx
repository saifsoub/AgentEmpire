import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...props} />;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary: "bg-accent text-white hover:opacity-90",
    secondary: "bg-surface2 text-primary border border-border hover:bg-[#22304a]",
    ghost: "bg-transparent text-secondary hover:text-primary",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-border bg-surface2 px-3 py-1 text-xs font-medium text-secondary",
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
        "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/40",
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
        "w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/40",
        props.className
      )}
    />
  );
}
