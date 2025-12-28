import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium transition-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none border-4 border-double active:translate-y-1 active:shadow-none uppercase tracking-wider",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground border-primary hover:brightness-110 shadow-[4px_4px_0px_0px_rgba(0,255,65,0.5)]",
				destructive:
					"bg-destructive text-white border-destructive hover:brightness-110 shadow-[4px_4px_0px_0px_rgba(255,51,51,0.5)]",
				outline:
					"border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-[4px_4px_0px_0px_rgba(0,255,65,0.3)]",
				secondary:
					"bg-secondary text-secondary-foreground border-secondary hover:brightness-110 shadow-[4px_4px_0px_0px_rgba(42,42,42,0.5)]",
				ghost:
					"border-transparent hover:bg-accent hover:text-accent-foreground shadow-none",
				link: "text-primary underline-offset-4 hover:underline border-none shadow-none",
			},
			size: {
				default: "h-12 px-6 py-3 has-[>svg]:px-4",
				sm: "h-10 gap-1.5 px-4 has-[>svg]:px-3",
				lg: "h-14 px-8 has-[>svg]:px-6",
				icon: "size-12",
				"icon-sm": "size-10",
				"icon-lg": "size-14",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
