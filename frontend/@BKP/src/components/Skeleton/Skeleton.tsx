import React from "react";
import { Skeleton as ChakraSkeleton, SkeletonText, SkeletonCircle } from "@chakra-ui/react";

type Variant = "text" | "rect" | "avatar" | "card";

interface Props {
  width?: string | number;
  height?: string | number;
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
  isLoaded?: boolean;
}

export const Skeleton: React.FC<Props> = ({ width, height, variant = "rect", className, style, isLoaded }) => {
  const commonProps: any = {
    isLoaded: !!isLoaded,
    style,
  };

  if (variant === "text") {
    return <SkeletonText noOfLines={1} spacing="4" {...commonProps} />;
  }

  if (variant === "avatar") {
    return <SkeletonCircle size={height ?? width ?? "10"} {...commonProps} />;
  }

  // rect and card map to ChakraSkeleton
  return <ChakraSkeleton height={height ? String(height) : undefined} width={width ? String(width) : undefined} {...commonProps} />;
};

export default Skeleton;
