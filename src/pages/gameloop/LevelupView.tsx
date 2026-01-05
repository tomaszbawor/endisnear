import { useAtomValue } from "@effect-atom/atom-react";
import { DebugStuff } from "@/components/Debug";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentPlayerAtom } from "@/state/playerState";

export default function LevelUpView() {
	const character = useAtomValue(currentPlayerAtom);

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Level up </CardTitle>
			</CardHeader>
			<CardContent className="h-125">
				<DebugStuff object={character} />
			</CardContent>
		</Card>
	);
}
