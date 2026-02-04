import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TutorialTooltipPlacement = "top" | "bottom" | "left" | "right";

interface TutorialTooltipProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  placement?: TutorialTooltipPlacement;
  /** When true, tooltip is fixed on the right side (for step 3 / music). Arrow points right. */
  fixedRight?: boolean;
  /** Optional wrapper content; when provided, tooltip is positioned relative to it. */
  children?: React.ReactNode;
  isVisible: boolean;
}

const arrowClasses: Record<TutorialTooltipPlacement, string> = {
  top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-card",
  bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-card",
  left: "right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-r-transparent border-l-card",
  right: "left-full top-1/2 -translate-y-1/2 ml-0 border-t-transparent border-b-transparent border-r-transparent border-l-card",
};

export function TutorialTooltip({
  title,
  description,
  buttonText,
  onButtonClick,
  placement = "bottom",
  fixedRight,
  children,
  isVisible,
}: TutorialTooltipProps) {
  const content = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative z-50 w-full max-w-[280px] rounded-xl border border-primary/40 bg-card/95 p-4 shadow-xl backdrop-blur-sm pointer-events-auto",
            fixedRight && "max-w-[260px] z-[100]"
          )}
        >
          {/* Arrow */}
          <div
            className={cn(
              "absolute h-0 w-0 border-8 border-card",
              fixedRight ? arrowClasses.right : arrowClasses[placement]
            )}
          />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          {buttonText != null && onButtonClick != null && (
            <Button
              size="sm"
              className="mt-3 w-full"
              onClick={onButtonClick}
            >
              {buttonText}
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (fixedRight) {
    return (
      <div className="fixed right-28 top-1/2 z-[100] -translate-y-1/2 mr-8 pointer-events-auto">
        {content}
      </div>
    );
  }

  if (children != null) {
    const tooltipSlot = (
      <div className={cn("flex justify-center", placement === "bottom" ? "mt-2" : "mb-2")}>
        {content}
      </div>
    );
    return (
      <div className="relative inline-flex flex-col items-center">
        {placement === "top" ? (
          <>
            {tooltipSlot}
            {children}
          </>
        ) : (
          <>
            {children}
            {tooltipSlot}
          </>
        )}
      </div>
    );
  }

  return content;
}
