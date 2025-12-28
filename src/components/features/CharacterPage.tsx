import { useEffect, useState } from "react";
import { Player } from "@/engine/player";
import { DebugStuff } from "../Debug";

export default function CharacterPage() {
	const [player, setPlayer] = useState<Player | null>(null);

	useEffect(() => {
		const player = new Player();
		player.name = "Josh";
		setPlayer(player);
	});

	return (
		<div className="border-4 border-accent p-6 bg-card shadow-[8px_8px_0px_0px_rgba(255,0,110,0.3)]">
			<h2 className="text-xl mb-4 text-accent">Character Stats</h2>
			<DebugStuff object={player} />
		</div>
	);
}
