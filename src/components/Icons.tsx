import * as React from "react";

export type IconName = "Frame" | "Search" | "Variable" | "Trash" | "Detach";

interface IconProps {
  name: IconName;
  className?: string;
  color?: string;
  onClick?: () => void;
}

export function Icon({
  name,
  className,
  color = "var(--figma-color-icon)",
  onClick,
}: IconProps) {
  return (
    <svg
      width="12"
      height="12"
      className={className}
      fill={color}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <use href={`#${name}`} />
    </svg>
  );
}

export function IconSprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ display: "none" }}
    >
      <symbol viewBox="0 0 16 16" id="Detach">
        <path fillRule="evenodd"
            d="M13.354 2.647a2.62 2.62 0 0 1 0 3.707l-1.5 1.5a.5.5 0 1 1-.708-.707l1.5-1.5a1.621 1.621 0 1 0-2.293-2.293l-1.5 1.5a.5.5 0 1 1-.707-.707l1.5-1.5a2.62 2.62 0 0 1 3.707 0M2.646 13.354a2.62 2.62 0 0 1 0-3.707l1.5-1.5a.5.5 0 1 1 .707.707l-1.5 1.5a1.621 1.621 0 0 0 2.293 2.293l1.5-1.5a.5.5 0 1 1 .707.707l-1.5 1.5a2.62 2.62 0 0 1-3.707 0M5.5 2a.5.5 0 0 1 .5.5V4a.5.5 0 1 1-1 0V2.5a.5.5 0 0 1 .5-.5m-3 3a.5.5 0 1 0 0 1H4a.5.5 0 0 0 0-1zm8 9a.5.5 0 0 1-.5-.5V12a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5m3-3a.5.5 0 1 0 0-1H12a.5.5 0 1 0 0 1z"
            clipRule="evenodd" />
    </symbol>
    <symbol viewBox="0 0 16 16" id="Frame">
        <path fillRule="evenodd"
            d="M4.5 2a.5.5 0 0 0-.5.5V4H2.5a.5.5 0 0 0 0 1H4v6H2.5a.5.5 0 0 0 0 1H4v1.5a.5.5 0 0 0 1 0V12h6v1.5a.5.5 0 0 0 1 0V12h1.5a.5.5 0 0 0 0-1H12V5h1.5a.5.5 0 0 0 0-1H12V2.5a.5.5 0 0 0-1 0V4H5V2.5a.5.5 0 0 0-.5-.5M11 5H5v6h6z"
            clipRule="evenodd" />
    </symbol>
    <symbol viewBox="0 0 16 16" id="Search">
        <path fillRule="evenodd"
            d="M11 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0m-.956 4.206a5.5 5.5 0 1 1 .662-.662.5.5 0 0 1 .148.102l3 3a.5.5 0 1 1-.707.708l-3-3a.5.5 0 0 1-.103-.148"
            clipRule="evenodd" />
    </symbol>
    <symbol viewBox="0 0 16 16" id="Trash">
        <path fillRule="evenodd"
            d="M6 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1zM5 2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2h2.5a1.5 1.5 0 0 1 .463 2.927l-.841 9.254A2 2 0 0 1 11.13 16H4.87a2 2 0 0 1-1.992-1.819l-.841-9.254A1.5 1.5 0 0 1 2.5 2zm8.494 2h.01a.5.5 0 0 0-.004-1h-11a.5.5 0 0 0-.004 1zm-.541 1H3.048l.826 9.09a1 1 0 0 0 .996.91h6.26a1 1 0 0 0 .996-.91zM7 7.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zm3 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0z"
            clipRule="evenodd" />
    </symbol>
    <symbol viewBox="0 0 16 16" id="Variable">
        <path fillRule="evenodd"
            d="m8.504 2.452 4 2.333a1 1 0 0 1 .496.864v4.702a1 1 0 0 1-.496.864l-4 2.333a1 1 0 0 1-1.008 0l-4-2.333A1 1 0 0 1 3 10.351V5.65a1 1 0 0 1 .496-.864l4-2.333a1 1 0 0 1 1.008 0m-1.512-.864a2 2 0 0 1 2.016 0l4 2.333A2 2 0 0 1 14 5.65v4.702a2 2 0 0 1-.992 1.728l-4 2.333a2 2 0 0 1-2.016 0l-4-2.333A2 2 0 0 1 2 10.35v-4.7a2 2 0 0 1 .992-1.728zM8 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
            clipRule="evenodd" />
    </symbol>
    </svg>
  );
}
