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
					<div className="grid grid-cols-1 text-sm mb-1">
						<span className="text-sm font-semibold justify-center">
							Level {hero?.level}
						</span>
						<span className="text-muted-foreground">
							{hero?.currentExp} / {hero?.expToNextLevel} EXP
						</span>
					</div>
					<Progress value={expPercentage} max={100} />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 gap-2 text-sm">
					<StatItem icon="❤️" label="HP" value={hero?.health ?? 0} />
					{/* TODO: FIX wrong parameters */}
					<StatItem icon="⚔️" label="ATK" value={hero?.stats.willpower ?? 0} />
					<StatItem icon="🛡️" label="DEF" value={hero?.stats.luck ?? 0} />
					<StatItem icon="⚡" label="SPD" value={hero?.stats.speed ?? 0} />
					<StatItem icon="💪" label="STR" value={hero?.stats.strength ?? 0} />
					<StatItem icon="🎯" label="DEX" value={hero?.stats.dexterity ?? 0} />
					<StatItem
						icon="🧠"
						label="INT"
						value={hero?.stats.intelligence ?? 0}
					/>
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
