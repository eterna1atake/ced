import React from 'react';

export default function Loading() {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[200px]">
            {/* Simple, formal spinner similar to Facebook/modern UIs */}
            {/* Background ring in light brand color, spinning segment in solid brand color */}
            <div className="w-10 h-10 rounded-full border-4 border-primary-main/20 border-t-primary-main animate-spin"></div>
        </div>
    );
}
