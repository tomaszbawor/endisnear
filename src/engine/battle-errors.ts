import { Data } from "effect";

export class BattleNotStartedError extends Data.TaggedError(
	"BattleNotStartedError",
)<{
	message: string;
}> {}

export class InvalidActionError extends Data.TaggedError("InvalidActionError")<{
	action: string;
	currentState: string;
	message: string;
}> {}

export class EntityDeadError extends Data.TaggedError("EntityDeadError")<{
	entityName: string;
	message: string;
}> {}

export class BattleAlreadyFinishedError extends Data.TaggedError(
	"BattleAlreadyFinishedError",
)<{
	message: string;
}> {}

export type BattleError =
	| BattleNotStartedError
	| InvalidActionError
	| EntityDeadError
	| BattleAlreadyFinishedError;
