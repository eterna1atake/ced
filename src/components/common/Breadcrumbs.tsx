import Link from "next/link";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-200 hover:text-primary-main focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/40"
                >
                  {item.label}
                </Link>
              ) : item.onClick && !isLast ? (
                <button
                  onClick={item.onClick}
                  className="transition-colors duration-200 hover:text-primary-main focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main/40"
                >
                  {item.label}
                </button>
              ) : (
                <span className="font-semibold text-primary-main">{item.label}</span>
              )}
              {index < items.length - 1 ? (
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="h-3 w-3 text-slate-400 sm:h-3.5 sm:w-3.5"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
