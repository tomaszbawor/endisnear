import type { PropsWithChildren } from "react";

export default function CenteredPageContainer({ children }: PropsWithChildren) {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-background">
			{/* Ambient background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-24 left-1/2 h-72 w-2xl -translate-x-1/2 rounded-full bg-foreground/5 blur-3xl" />
				<div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-foreground/5 blur-3xl" />
				<div className="absolute inset-0 [background:radial-gradient(circle_at_center,transparent_0,transparent_40%,hsl(var(--background))_72%)]" />
			</div>

			<div className="min-h-screen w-full flex items-center justify-center p-4">
				<div className="w-full max-w-[1024px] max-h-[768px] rounded-2xl shadow p-6 overflow-hidden ">
					{children}
				</div>
			</div>
		</div>
	);
}
