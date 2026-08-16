import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-serif text-h1 text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-prose-measure text-body text-foreground-muted">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Button asChild className="shrink-0">
          <Link href={action.href}>
            <Plus aria-hidden="true" />
            {action.label}
          </Link>
        </Button>
      ) : null}
    </header>
  );
}
