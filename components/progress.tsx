import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  variant?: "default" | "gradient" | "rainbow" | "dynamic";
  colorStart?: string;
  colorEnd?: string;
  height?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, variant = "default", colorStart, colorEnd, height = "sm", ...props }, ref) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Convert value to a safe number between 0-100
  const safeValue = Math.max(0, Math.min(100, value || 0));
  
  // Get height class based on size prop
  const getHeightClass = () => {
    switch (height) {
      case "xs": return "h-1";
      case "sm": return "h-2";  // Default
      case "md": return "h-3";
      case "lg": return "h-4";
      case "xl": return "h-6";
      default: return "h-2";
    }
  };
  
  // Get background style based on variant
  const getIndicatorStyles = () => {
    switch (variant) {
      case "gradient":
        return {
          background: `linear-gradient(90deg, ${colorStart || '#4338ca'}, ${colorEnd || '#ec4899'})`,
          transform: `translateX(-${100 - safeValue}%)`
        };
      case "rainbow":
        return {
          background: 'linear-gradient(90deg, #f44336, #ff9800, #ffeb3b, #4caf50, #2196f3, #9c27b0)',
          backgroundSize: '200% 100%',
          animation: 'rainbow-animation 2s linear infinite',
          transform: `translateX(-${100 - safeValue}%)`
        };
      case "dynamic":
        // Color changes based on progress value
        const hue = (safeValue * 1.2); // 0-120 range (red to green)
        return {
          background: `hsl(${hue}, 80%, 50%)`,
          transform: `translateX(-${100 - safeValue}%)`
        };
      default:
        return {
          background: '',
          transform: `translateX(-${100 - safeValue}%)`
        };
    }
  };

  const heightClass = getHeightClass();
  const indicatorStyles = getIndicatorStyles();
  
  return (
    <div className="relative">
      {mounted && variant === "rainbow" && (
        <style jsx global>{`
          @keyframes rainbow-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-primary/20",
          heightClass,
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all",
            variant === "default" ? "bg-primary" : ""
          )}
          style={indicatorStyles}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };