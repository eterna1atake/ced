import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface AddButtonProps {
    href?: string;
    onClick?: () => void;
    label: string;
    icon?: IconDefinition;
    disabled?: boolean;
}

export const AddButton = ({
    href,
    onClick,
    label,
    icon = faPlus,
    disabled = false
}: AddButtonProps) => {
    const baseClasses = `
        px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2
        ${disabled
            ? "bg-slate-300 dark:bg-slate-700 text-white cursor-not-allowed"
            : "bg-primary-main/90 hover:bg-primary-hover text-white shadow-sm active:scale-95 transform transition-all"
        }
    `;

    const content = (
        <>
            <span className="md:hidden"><FontAwesomeIcon icon={icon} /></span>
            <span className="hidden md:flex items-center gap-2">
                <FontAwesomeIcon icon={icon} />
                {label}
            </span>
        </>
    );

    if (disabled) {
        return (
            <button disabled className={baseClasses}>
                {content}
            </button>
        );
    }

    if (href) {
        return (
            <Link href={href} className={baseClasses}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseClasses}>
            {content}
        </button>
    );
};
