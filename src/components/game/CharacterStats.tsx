import { Atom, useAtomValue } from "@effect-atom/atom-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { currentPlayerAtom } from "@/state/playerState";

const expPercentageAtom = Atom.make((get) => {
	const hero = get(currentPlayerAtom);
	if (!hero) return 0;

	return (hero?.currentExp / hero?.expToNextLevel) * 100;
});

export function CharacterStats() {
	const expPercentage = useAtomValue(expPercentageAtom);
	const hero = useAtomValue(currentPlayerAtom);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{hero?.name}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Level & EXP */}
				<div>
					<div className="flex justify-between text-sm mb-1">
						<span className="font-semibold">Level {hero?.level}</span>
						<span className="text-muted-foreground">
							{hero?.currentExp} / {hero?.expToNextLevel} EXP
						</span>
					</div>
					<Progress value={expPercentage} max={100} />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-2 text-sm">
					<StatItem icon="⚔️" label="ATK" value={hero?.stats.attack ?? 0} />
					<StatItem icon="🛡️" label="DEF" value={hero?.stats.defense ?? 0} />
					<StatItem icon="❤️" label="HP" value={hero?.stats.health ?? 0} />
					<StatItem icon="⚡" label="SPD" value={hero?.stats.speed ?? 0} />
					<StatItem icon="💪" label="STR" value={hero?.stats.strength ?? 0} />
					<StatItem icon="🎯" label="DEX" value={hero?.stats.dexterity ?? 0} />
					<StatItem icon="🧠" label="INT" value={hero?.stats.dexterity ?? 0} />
				</div>
			</CardContent>
		</Card>
	);
}

function StatItem({
	icon,
	label,
	value,
}: {
	icon: string;
	label: string;
	value: number;
}) {
	return (
		<div className="flex items-center gap-1">
			<span>{icon}</span>
			<span className="text-muted-foreground">{label}:</span>
			<span className="font-semibold">{value}</span>
		</div>
	);
}
