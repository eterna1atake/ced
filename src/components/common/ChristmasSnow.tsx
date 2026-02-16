
"use client";

import Snowfall from 'react-snowfall';

function ChristmasSnow() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
            aria-hidden="true"
        >
            <Snowfall
                style={{
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                }}
                snowflakeCount={100} />
        </div>
    );
}

export default ChristmasSnow;
