import Link from 'next/link';
import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="w-full flex py-4 text-[13px] text-[#737373] tracking-wider uppercase font-semibold">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[#1A1918] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-[#1A1918]" : ""}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <span className="mx-2 material-symbols-outlined text-[14px] text-[#C2BDB5]">
                  chevron_right
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
