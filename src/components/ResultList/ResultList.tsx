import * as React from "react";
import "./ResultList.css";
import { Icon, IconName } from "../Icons";

interface ResultListItemProps {
  content: string;
  icon?: IconName;
  onClick?: () => void;
}

export function ResultList({ children }: { children: React.ReactNode }) {
  return <ul className="results-list">{children}</ul>;
}

export function ResultListItem({ content, icon = "Frame", onClick }: ResultListItemProps) {
  return (
    <li className="result-item" onClick={onClick}>
      <Icon name={icon} color="var(--figma-color-icon-tertiary)" />
      <span>{content}</span>
    </li>
  );
}
