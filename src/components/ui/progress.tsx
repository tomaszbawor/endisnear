import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	value: number;
	max?: number;
	showLabel?: boolean;
	variant?: "default" | "success" | "warning" | "danger";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
	(
		{
			value,
			max = 100,
			showLabel = true,
			variant = "default",
			className,
			...props
		},
		ref,
	) => {
		const percentage = Math.max(0, Math.min(100, (value / max) * 100));

		const variantClasses = {
			default: "bg-primary",
			success: "bg-green-500",
			warning: "bg-yellow-500",
			danger: "bg-destructive",
		};

		const getVariant = () => {
			if (variant !== "default") return variant;
			if (percentage > 60) return "success";
			if (percentage > 30) return "warning";
			return "danger";
		};

		return (
			<div
				ref={ref}
				className={cn(
					"relative h-6 w-full overflow-hidden border-2 border-foreground bg-background",
					className,
				)}
				{...props}
			>
				<div
					className={cn(
						"h-full transition-all duration-300 ease-in-out",
						variantClasses[getVariant()],
					)}
					style={{ width: `${percentage}%` }}
				/>
				{showLabel && (
					<div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground mix-blend-difference">
						{Math.round(value)}/{max}
					</div>
				)}
			</div>
		);
	},
);

Progress.displayName = "Progress";

export { Progress };
