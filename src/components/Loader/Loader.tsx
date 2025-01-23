import * as React from "react";
import "./Loader.css";

interface LoaderProps {
  label: string;
}

export function Loader({ label }: LoaderProps) {
  return <div className="loader">{label}</div>;
}
