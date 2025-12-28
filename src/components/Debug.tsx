interface DebugProps {
	// biome-ignore lint/suspicious/noExplicitAny: its only for debug
	object: any;
}

export const DebugStuff: React.FC<DebugProps> = ({ object }) => {
	return (
		<pre className="text-xs overflow-auto bg-background p-4 border-2 border-muted">
			{JSON.stringify(object, null, 2)}
		</pre>
	);
};
