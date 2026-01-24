
import type {SVGProps} from 'react';

type PipeIconProps = SVGProps<SVGSVGElement> & {
  color?: string;
  strokeWidth?: number;
};

export function PipeIcon({
  color = 'currentColor',
  strokeWidth = 6,
  className,
  ...props
}: PipeIconProps) {
  return (
    <svg
      viewBox="0 0 50 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
    >
      <path d="M25 200V0" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export default PipeIcon;
