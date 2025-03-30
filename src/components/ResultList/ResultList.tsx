import * as React from "react";
import "./ResultList.css";
import { Icon, IconName } from "../Icons";

interface ResultListItemProps {
  content: string;
  icon?: IconName;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function ResultList({ children, className }: { children: React.ReactNode, className?: string }) {
  return <ul className={`results-list ${className}`}>{children}</ul>;
}

export function ResultListItem({ content, icon = "Frame", onClick, children }: ResultListItemProps) {
  return (
    <li className="result-item" onClick={onClick}>
      <Icon name={icon} color="var(--figma-color-icon-tertiary)" />
      <span>{content}</span>
      {children}
    </li>
  );
}
