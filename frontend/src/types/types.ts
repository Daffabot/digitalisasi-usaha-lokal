import { ReactNode } from "react";

export interface BaseProps {
  children?: ReactNode;
  className?: string;
}

export interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export interface DocumentData {
  id: string;
  name: string;
  date: string;
  previewUrl: string;
}
