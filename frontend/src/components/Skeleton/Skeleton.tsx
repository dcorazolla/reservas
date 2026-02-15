import React from "react";
import "./skeleton.css";

type Variant = "text" | "rect" | "avatar" | "card";

interface Props {
  width?: string | number;
  height?: string | number;
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<Props> = ({ width, height, variant = "rect", className, style }) => {
  const inlineStyle: React.CSSProperties = {
    width: width ?? (variant === "text" ? "100%" : undefined),
    height: height ?? (variant === "text" ? 16 : undefined),
    ...style,
  };

  return <div className={`skeleton skeleton--${variant} ${className ?? ""}`} style={inlineStyle} aria-hidden="true" />;
};

export default Skeleton;
