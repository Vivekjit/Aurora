import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BaseCardProps {
    children: ReactNode;
    className?: string; // For additional styling if needed
}

export function BaseCard({ children, className }: BaseCardProps) {
    return (
        <div className={cn(
            "h-screen w-full snap-start relative flex flex-col items-center justify-center bg-white overflow-hidden",
            className
        )}>
            {children}
        </div>
    );
}
