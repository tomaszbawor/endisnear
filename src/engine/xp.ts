export class Exp {
	exp: number = 0;
	level: number = 1;
	expToLevelUp = expNeedForLevel(1);

	canLevelUp() {
		return this.exp >= this.expToLevelUp;
	}
}

const expNeedForLevel = (level: number) => {
	return 40 * level * level + 60 * level;
};
