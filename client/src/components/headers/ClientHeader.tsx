import React from "react";
import { LucideIcon } from "lucide-react";

interface ClientHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function ClientHeader({
  title,
  description,
  icon,
  actions,
}: ClientHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}