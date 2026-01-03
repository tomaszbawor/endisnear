interface StatItem {
	icon?: string;
	label: string;
	value: string | number;
}

interface StatsDisplayProps {
	stats: StatItem[];
	columns?: 2 | 3 | 4;
	className?: string;
}

export function StatsDisplay({
	stats,
	columns = 2,
	className = "",
}: StatsDisplayProps) {
	const gridClass = `grid-cols-${columns}`;

	return (
		<div className={`grid ${gridClass} gap-2 text-sm ${className}`}>
			{stats.map((stat, index) => (
				<div key={`${stat.label}-${index}`}>
					{stat.icon && `${stat.icon} `}
					{stat.label}: {stat.value}
				</div>
			))}
		</div>
	);
}

interface CombatStatsDisplayProps {
	attack: number;
	defense: number;
	speed: number;
	additionalStats?: Record<string, string | number>;
}

export function CombatStatsDisplay({
	attack,
	defense,
	speed,
	additionalStats,
}: CombatStatsDisplayProps) {
	const stats: StatItem[] = [
		{ icon: "⚔️", label: "ATK", value: attack },
		{ icon: "🛡️", label: "DEF", value: defense },
		{ icon: "⚡", label: "SPD", value: speed },
	];

	if (additionalStats) {
		for (const [label, value] of Object.entries(additionalStats)) {
			stats.push({ label, value });
		}
	}

	return <StatsDisplay stats={stats} />;
}
