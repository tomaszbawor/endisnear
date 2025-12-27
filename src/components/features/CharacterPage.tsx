import { useEffect, useState } from "react";
import { Player } from "@/engine/player";

export default function CharacterPage() {
	const [player, setPlayer] = useState<Player | null>(null);

	useEffect(() => {
		const player = new Player();
		player.name = "Josh";
		setPlayer(player);
	});

	return (
		<div>
			<pre>{JSON.stringify(player, null, 2)}</pre>
		</div>
	);
}
