import { Atom, useAtomValue } from "@effect-atom/atom-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { currentPlayerAtom } from "@/state/playerState";
import type { PlayerStats } from "@/types/equipment";

interface CharacterStatsProps {
	stats: PlayerStats;
}

const expPercentageAtom = Atom.make((get) => {
	const hero = get(currentPlayerAtom);
	if (!hero) return 0;

	return (hero?.currentExp / hero?.expToNextLevel) * 100;
});

export function CharacterStats({ stats }: CharacterStatsProps) {
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
						<span className="font-semibold">Level {stats.level}</span>
						<span className="text-muted-foreground">
							{hero?.currentExp} / {hero?.expToNextLevel} EXP
						</span>
					</div>
					<Progress value={expPercentage} max={100} />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-2 text-sm">
					<StatItem icon="⚔️" label="ATK" value={stats.totalStats.attack ?? 0} />
					<StatItem
						icon="🛡️"
						label="DEF"
						value={stats.totalStats.defense ?? 0}
					/>
					<StatItem icon="❤️" label="HP" value={stats.totalStats.health ?? 0} />
					<StatItem icon="⚡" label="SPD" value={stats.totalStats.speed ?? 0} />
					<StatItem
						icon="💪"
						label="STR"
						value={stats.totalStats.strength ?? 0}
					/>
					<StatItem
						icon="🎯"
						label="DEX"
						value={stats.totalStats.dexterity ?? 0}
					/>
					<StatItem
						icon="🧠"
						label="INT"
						value={stats.totalStats.intelligence ?? 0}
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
