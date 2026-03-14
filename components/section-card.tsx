import { Card } from "@/components/ui";
export function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode; }) { return <Card className="p-5"><div className="mb-4"><h3 className="text-lg font-semibold text-primary">{title}</h3>{description ? <p className="mt-1 text-sm text-secondary">{description}</p> : null}</div>{children}</Card>; }
