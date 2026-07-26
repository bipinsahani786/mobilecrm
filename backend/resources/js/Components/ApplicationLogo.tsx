import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Warm sand background squircle with border */}
            <rect width="100" height="100" rx="28" fill="#F7F4EB" stroke="#D4CBB3" strokeWidth="2" />
            
            {/* Bold emerald-800 letter M path */}
            <path
                d="M30 68V32H40L50 49L60 32H70V68H62V46L50 63L38 46V68H30Z"
                fill="#065f46"
            />
        </svg>
    );
}
