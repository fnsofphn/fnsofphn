import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { RecordManager, type RecordManagerConfig } from "@/features/shared/record-manager";

type ModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  manager: RecordManagerConfig & {
    rows: Array<Record<string, unknown>>;
  };
};

export function ModulePage({ eyebrow, title, description, children, manager }: ModulePageProps) {
  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      {children}
      <RecordManager {...manager} />
    </PageTransition>
  );
}
