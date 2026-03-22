import { Card } from "@/components/ui";
export function StatCard({ label, value, footnote }: { label: string; value: string | number; footnote?: string; }) { return <Card className="p-5"><div className="text-sm text-secondary">{label}</div><div className="mt-3 text-3xl font-semibold text-primary">{value}</div>{footnote ? <div className="mt-2 text-sm text-muted">{footnote}</div> : null}</Card>; }
