import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BattleLogProps {
	logs: string[];
	title?: string;
	height?: string;
	emptyMessage?: string;
}

export function BattleLog({
	logs,
	title = "Battle Log",
	height = "h-64",
	emptyMessage = "Battle log will appear here...",
}: BattleLogProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div
					className={`${height} overflow-y-auto bg-background border-2 border-foreground p-4 font-mono text-xs space-y-1`}
				>
					{logs.length === 0 ? (
						<div className="text-muted-foreground text-center py-8">
							{emptyMessage}
						</div>
					) : (
						logs.map((log) => {
							const [id, ...messageParts] = log.split("|");
							const message = messageParts.join("|");
							return (
								<div key={id} className="text-foreground">
									{message}
								</div>
							);
						})
					)}
				</div>
			</CardContent>
		</Card>
	);
}
