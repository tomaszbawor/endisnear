import { Atom, useAtomValue } from "@effect-atom/atom-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { currentPlayerAtom, statsWithInventoryAtom } from "@/state/playerState";

const expPercentageAtom = Atom.make((get) => {
	const hero = get(currentPlayerAtom);
	if (!hero) return 0;

	return (hero?.currentExp / hero?.expToNextLevel) * 100;
});

export function CharacterStats() {
	const expPercentage = useAtomValue(expPercentageAtom);
	const hero = useAtomValue(currentPlayerAtom);
	const effectiveStats = useAtomValue(statsWithInventoryAtom);

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
					<StatItem
						icon="❤️"
						label="HP"
						value={effectiveStats?.health ?? 0}
						baseValue={hero?.health}
					/>
					{/* TODO: FIX wrong parameters */}
					<StatItem icon="⚔️" label="ATK" value={effectiveStats?.attack ?? 0} />
					<StatItem icon="🛡️" label="DEF" value={effectiveStats?.defence ?? 1} />
					<StatItem
						icon="⚡"
						label="SPD"
						value={effectiveStats?.speed ?? 0}
						baseValue={hero?.stats.speed}
					/>
					<StatItem
						icon="💪"
						label="STR"
						value={effectiveStats?.strength ?? 0}
						baseValue={hero?.stats.strength}
					/>

					<StatItem
						icon="🧠"
						label="WIL"
						value={effectiveStats?.willpower ?? 0}
						baseValue={hero?.stats.willpower}
					/>

					<StatItem
						icon="🎯"
						label="DEX"
						value={effectiveStats?.dexterity ?? 0}
						baseValue={hero?.stats.dexterity}
					/>
					<StatItem
						icon="📖"
						label="INT"
						value={effectiveStats?.intelligence ?? 0}
						baseValue={hero?.stats.intelligence}
					/>

					<StatItem
						icon="🍀"
						label="LCK"
						value={effectiveStats?.luck ?? 0}
						baseValue={hero?.stats.luck}
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
	baseValue,
}: {
	icon: string;
	label: string;
	value: number;
	baseValue?: number;
}) {
	const shouldDisplayBaseStats: boolean =
		baseValue !== undefined && baseValue !== value;

	return (
		<div className="flex items-center gap-1">
			<span>{icon}</span>
			<span className="text-muted-foreground">{label}:</span>
			<span className="font-semibold">{value}</span>
			{shouldDisplayBaseStats && (
				<span className="font-extralight text-xs">({baseValue ?? value})</span>
			)}
		</div>
	);
}
