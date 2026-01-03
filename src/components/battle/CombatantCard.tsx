import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CombatStats } from "@/engine/entity";
import type { Stats } from "@/engine/stats";

interface CombatantCardProps {
	name: string;
	icon: string;
	health: number;
	maxHealth: number;
	stats: {
		attack: number;
		defense: number;
		speed: number;
	};
	additionalInfo?: Record<string, string | number>;
	variant?: "hero" | "enemy";
	isEmpty?: boolean;
	emptyMessage?: string;
}

export function CombatantCard({
	name,
	icon,
	health,
	maxHealth,
	stats,
	additionalInfo,
	variant = "hero",
	isEmpty = false,
	emptyMessage = "Ready to battle!",
}: CombatantCardProps) {
	const titleClassName =
		variant === "hero" ? "text-primary" : "text-destructive";
	const progressVariant = variant === "enemy" ? "danger" : "default";

	if (isEmpty) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className={titleClassName}>
						{icon} {name}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground text-center py-8">
						{emptyMessage}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className={titleClassName}>
					{icon} {name}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<div>
					<div className="flex justify-between text-sm mb-1">
						<span>Health</span>
						<span>
							{health}/{maxHealth}
						</span>
					</div>
					<Progress value={health} max={maxHealth} variant={progressVariant} />
				</div>
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div>⚔️ ATK: {stats.attack}</div>
					<div>🛡️ DEF: {stats.defense}</div>
					<div>⚡ SPD: {stats.speed}</div>
					{additionalInfo &&
						Object.entries(additionalInfo).map(([key, value]) => (
							<div key={key}>
								{key}: {value}
							</div>
						))}
				</div>
			</CardContent>
		</Card>
	);
}

export interface CombatantData {
	name: string;
	combatStats: CombatStats;
	stats?: Stats;
}

interface SimpleCombatantCardProps {
	combatant: CombatantData | null;
	icon: string;
	variant?: "hero" | "enemy";
	emptyMessage?: string;
	additionalInfo?: Record<string, string | number>;
}

export function SimpleCombatantCard({
	combatant,
	icon,
	variant = "hero",
	emptyMessage,
	additionalInfo,
}: SimpleCombatantCardProps) {
	if (!combatant) {
		return (
			<CombatantCard
				name={variant === "hero" ? "Hero" : "No Monster"}
				icon={icon}
				health={0}
				maxHealth={100}
				stats={{ attack: 0, defense: 0, speed: 0 }}
				variant={variant}
				isEmpty={true}
				emptyMessage={emptyMessage}
			/>
		);
	}

	return (
		<CombatantCard
			name={combatant.name}
			icon={icon}
			health={combatant.combatStats.health}
			maxHealth={combatant.combatStats.maxHealth}
			stats={{
				attack: combatant.combatStats.attack,
				defense: combatant.combatStats.defense,
				speed: combatant.combatStats.speed,
			}}
			variant={variant}
			additionalInfo={additionalInfo}
		/>
	);
}
