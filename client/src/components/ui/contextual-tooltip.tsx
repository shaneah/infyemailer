import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";

interface ContextualTooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  width?: string;
  variant?: "default" | "info" | "help";
}

/**
 * ContextualTooltip - A component that displays a tooltip with fade-in animation
 * @param content - The content to display in the tooltip
 * @param children - The trigger element (optional)
 * @param icon - An icon to use as the trigger (if no children provided)
 * @param side - Side to display the tooltip on
 * @param align - Alignment of the tooltip
 * @param delayDuration - Delay before showing tooltip (ms)
 * @param width - Width of the tooltip content
 * @param variant - Visual style variant of the tooltip
 */
export function ContextualTooltip({
  content,
  children,
  icon,
  side = "top",
  align = "center",
  delayDuration = 200,
  width = "auto",
  variant = "default",
}: ContextualTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine icon based on variant if no custom icon is provided
  const defaultIcon = 
    variant === "info" ? <Info className="h-4 w-4" /> : 
    variant === "help" ? <HelpCircle className="h-4 w-4" /> : 
    null;

  // Set icon style based on variant
  const iconStyle = 
    variant === "info" ? "text-blue-500" : 
    variant === "help" ? "text-indigo-500" : 
    "text-gray-500";

  const tooltipVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: side === "bottom" ? -5 : side === "top" ? 5 : 0,
      x: side === "right" ? -5 : side === "left" ? 5 : 0,
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      x: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { 
        duration: 0.15, 
        ease: "easeIn" 
      }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip 
        delayDuration={delayDuration} 
        onOpenChange={setIsOpen}
      >
        <TooltipTrigger asChild>
          {children || (
            <span className={`inline-flex cursor-help ${iconStyle} hover:opacity-80 transition-opacity`}>
              {icon || defaultIcon}
            </span>
          )}
        </TooltipTrigger>
        <AnimatePresence>
          {isOpen && (
            <TooltipContent 
              side={side} 
              align={align}
              className="p-0 border-none shadow-lg bg-transparent"
              style={{ width }}
              asChild
            >
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tooltipVariants}
                className={`rounded-md p-3 text-sm ${
                  variant === "info" 
                    ? "bg-blue-50 text-blue-900 border border-blue-200" 
                    : variant === "help" 
                    ? "bg-indigo-50 text-indigo-900 border border-indigo-200"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {content}
              </motion.div>
            </TooltipContent>
          )}
        </AnimatePresence>
      </Tooltip>
    </TooltipProvider>
  );
}