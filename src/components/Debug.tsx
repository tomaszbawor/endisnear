interface DebugProps {
	// biome-ignore lint/suspicious/noExplicitAny: its only for debug
	object: any;
}

export const DebugStuff: React.FC<DebugProps> = ({ object }) => {
	return (
		<code className="rounded bg-muted px-1 py-0.5">
			{JSON.stringify(object, null, 2)}
		</code>
	);
};
