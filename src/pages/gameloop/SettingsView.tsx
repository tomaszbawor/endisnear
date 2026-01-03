import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsView() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Settings</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="text-sm text-muted-foreground">
						Game settings coming soon...
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
