import { Atom, useAtomValue } from "@effect-atom/atom-react";
import { DebugStuff } from "@/components/Debug";
import { Player } from "@/engine/player";
import { gameConfigAtom } from "@/state/gameConfig";

// Local atom for player - initialized once
const playerAtom = Atom.make(() => {
	const player = new Player();
	player.name = "Josh";
	return player;
});

export default function CharacterPage() {
	// Use atom instead of useState + useEffect
	const player = useAtomValue(playerAtom);
	const settings = useAtomValue(gameConfigAtom);

	return (
		<div className="border-4 border-accent p-6 bg-card shadow-[8px_8px_0px_0px_rgba(255,0,110,0.3)]">
			<h2 className="text-xl mb-4 text-accent">Character Stats</h2>
			<DebugStuff object={player} />
			<h2 className="text-xl mb-4 text-accent">Character Stats</h2>
			<DebugStuff object={settings} />
		</div>
	);
}
