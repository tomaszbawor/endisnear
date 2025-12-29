import type { BattleEvent, BattleEventListener } from "./battle-events";
import { BattleAction, BattleFSM, BattleState } from "./battle-fsm";
import type { Entity } from "./entity";
import type { Monster } from "./monster";

export interface BattleResult {
	victory: boolean;
	fled: boolean;
	expGained: number;
	turnCount: number;
	events: BattleEvent[];
}

export class BattleSystem {
	private fsm: BattleFSM;
	private events: BattleEvent[] = [];
	private eventStream: ReadableStream<BattleEvent> | null = null;
	private streamController: ReadableStreamDefaultController<BattleEvent> | null =
		null;

	constructor(player: Entity, enemy: Monster) {
		this.fsm = new BattleFSM(player, enemy, enemy.expReward);

		this.fsm.subscribe((event) => {
			this.events.push(event);
			if (this.streamController) {
				this.streamController.enqueue(event);
			}
		});
	}

	createEventStream(): ReadableStream<BattleEvent> {
		this.eventStream = new ReadableStream<BattleEvent>({
			start: (controller) => {
				this.streamController = controller;
			},
			cancel: () => {
				this.streamController = null;
			},
		});

		return this.eventStream;
	}

	subscribe(listener: BattleEventListener): () => void {
		return this.fsm.subscribe(listener);
	}

	start(): void {
		if (this.fsm.getState() === BattleState.INITIALIZING) {
			this.fsm.initialize();
		}
	}

	tick(): void {
		const state = this.fsm.getState();

		switch (state) {
			case BattleState.TURN_START:
				this.fsm.startTurn();
				break;

			case BattleState.ENEMY_TURN:
				this.fsm.executeEnemyTurn();
				break;

			case BattleState.CHECKING_VICTORY:
				this.fsm.checkVictoryConditions();
				break;

			default:
				break;
		}
	}

	playerAttack(): void {
		if (this.fsm.getState() === BattleState.PLAYER_TURN) {
			this.fsm.executeAction(BattleAction.ATTACK);
		}
	}

	playerFlee(): void {
		if (this.fsm.getState() === BattleState.PLAYER_TURN) {
			this.fsm.executeAction(BattleAction.FLEE);
		}
	}

	isWaitingForPlayerInput(): boolean {
		return this.fsm.getState() === BattleState.PLAYER_TURN;
	}

	isFinished(): boolean {
		return this.fsm.isFinished();
	}

	getResult(): BattleResult | null {
		if (!this.isFinished()) {
			return null;
		}

		const state = this.fsm.getState();
		const context = this.fsm.getContext();

		return {
			victory: state === BattleState.VICTORY,
			fled: state === BattleState.FLED,
			expGained: state === BattleState.VICTORY ? context.expReward : 0,
			turnCount: context.turnNumber,
			events: this.events,
		};
	}

	getEvents(): BattleEvent[] {
		return [...this.events];
	}

	getCurrentState(): BattleState {
		return this.fsm.getState();
	}

	async runAutoBattle(): Promise<BattleResult> {
		this.start();

		return new Promise((resolve) => {
			const runLoop = () => {
				if (this.isFinished()) {
					const result = this.getResult();
					if (this.streamController) {
						this.streamController.close();
					}
					if (result) {
						resolve(result);
					}
					return;
				}

				if (this.isWaitingForPlayerInput()) {
					this.playerAttack();
				}

				this.tick();
				setTimeout(runLoop, 10);
			};

			runLoop();
		});
	}
}
