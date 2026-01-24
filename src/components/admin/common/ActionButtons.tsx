import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

interface ActionButtonsProps {
    editUrl: string;
    onDelete: () => void;
    deleteLabel?: string;
    editLabel?: string;
}

export const ActionButtons = ({
    editUrl,
    onDelete,
    editLabel = "Edit",
    deleteLabel = "Delete"
}: ActionButtonsProps) => {
    return (
        <div className="flex items-center justify-end gap-3">
            <Link
                href={editUrl}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium text-sm inline-flex items-center gap-1.5 transition-colors p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                title={editLabel}
            >
                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                <span>{editLabel}</span>
            </Link>
            <button
                onClick={onDelete}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm inline-flex items-center gap-1.5 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                title={deleteLabel}
            >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                <span>{deleteLabel}</span>
            </button>
        </div>
    );
};
