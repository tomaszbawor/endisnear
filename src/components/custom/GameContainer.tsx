import type { PropsWithChildren } from "react";

/**
 * Fixed-dimension centered container for all game pages
 * Provides consistent 1400x900 resolution centered on screen
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

			{/* Centered fixed-size game content */}
			<div className="min-h-screen w-full flex items-center justify-center p-4">
				<div className="w-full h-[900px] max-w-[1400px] rounded-2xl shadow-2xl p-6 overflow-hidden bg-background/50 backdrop-blur-sm border border-foreground/10">
					{children}
				</div>
			</div>
		</div>
	);
}
