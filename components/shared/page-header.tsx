import { GlowBadge } from "@/components/shared/glow-badge";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <GlowBadge>{eyebrow}</GlowBadge>
        <h1 className="mt-4 text-3xl font-bold tracking-normal text-text-primary md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
