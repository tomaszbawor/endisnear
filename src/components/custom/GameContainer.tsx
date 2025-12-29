import type { PropsWithChildren } from "react";

/**
 * Full-viewport container for game pages
 * Provides proper resolution for browser gameplay with responsive layout
 */
export default function GameContainer({ children }: PropsWithChildren) {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-background">
			{/* Ambient background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-24 left-1/2 h-72 w-2xl -translate-x-1/2 rounded-full bg-foreground/5 blur-3xl" />
				<div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-foreground/5 blur-3xl" />
				<div className="absolute inset-0 [background:radial-gradient(circle_at_center,transparent_0,transparent_40%,hsl(var(--background))_72%)]" />
			</div>

			{/* Full viewport game content */}
			<div className="relative min-h-screen w-full p-4">{children}</div>
		</div>
	);
}
