import * as React from "react";

export type IconName = "Frame" | "Search" | "Variable";

interface IconProps {
  name: IconName;
  className?: string;
  color?: string;
  onClick?: () => void;
}

export function Icon({ name, className, color = "var(--figma-color-icon)", onClick }: IconProps) {
  return (
    <svg
      width="12"
      height="12"
      className={className}
      fill={color}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <use href={`#${name}`} />
    </svg>
  );
}

export function IconSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'none' }}>
      <symbol viewBox="0 0 12 12" id="Frame">
        <g clipPath="url(#aa)">
          <path fillRule="evenodd" d="M4 .5V3h4V.5h1V3h2.5v1H9v4h2.5v1H9v2.5H8V9H4v2.5H3V9H.5V8H3V4H.5V3H3V.5zM8 8V4H4v4z" clipRule="evenodd" />
        </g>
        <defs>
          <clipPath id="aa">
            <path d="M0 0h12v12H0z" />
          </clipPath>
        </defs>
      </symbol>
      <symbol viewBox="0 0 12 12" id="Search">
        <path fillRule="evenodd"
          d="M7.453 8.16A3.999 3.999 0 0 1 1 5c0-2.21 1.79-4 4-4a3.999 3.999 0 0 1 3.16 6.453l3.194 3.193-.708.707zM8 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
          clipRule="evenodd" />
      </symbol>
      <symbol viewBox="0 0 12 12" id="Variable">
        <path fillRule="evenodd"
          d="m2 3.693 4-2.31 4 2.31v4.619l-4 2.31-4-2.31zM6 .23l5 2.887V8.89l-5 2.887L1 8.89V3.116zM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
          clipRule="evenodd" />
      </symbol>
    </svg>
  )
}