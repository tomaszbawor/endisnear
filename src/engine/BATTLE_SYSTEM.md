# Battle System Architecture

A comprehensive, extensible battle system built with design patterns and finite state machine architecture.

## Overview

The battle system handles turn-based combat between entities (players and monsters), emitting a stream of events for UI integration and logging.

## Design Patterns Used

### 1. **State Pattern (FSM - Finite State Machine)**
- **File**: `battle-fsm.ts`
- **Purpose**: Manages battle flow through well-defined states
- **States**:
  - `INITIALIZING` - Setting up battle
  - `TURN_START` - Beginning a new turn
  - `PLAYER_TURN` - Waiting for player input
  - `ENEMY_TURN` - AI processing enemy action
  - `PROCESSING_ACTION` - Executing combat actions
  - `CHECKING_VICTORY` - Evaluating win/loss conditions
  - `VICTORY` - Player won
  - `DEFEAT` - Player lost
  - `FLED` - Player escaped

### 2. **Observer Pattern**
- **Files**: `battle-events.ts`, `battle-fsm.ts`
- **Purpose**: Event-driven architecture for battle updates
- **Implementation**: Subscribe/emit pattern for battle events
- **Benefits**: Decouples battle logic from UI/logging

### 3. **Strategy Pattern**
- **File**: `entity.ts`
- **Purpose**: Flexible damage calculation and combat mechanics
- **Implementation**: `calculateDamage()` method can be overridden
- **Benefits**: Easy to add new combat formulas or special abilities

### 4. **Template Method Pattern**
- **File**: `entity.ts`
- **Purpose**: Base entity behavior with customizable stats
- **Implementation**: Abstract `Entity` class with concrete implementations
- **Benefits**: Consistent entity interface, custom implementations

### 5. **Factory Pattern**
- **File**: `monster-database.ts`
- **Purpose**: Create monsters from templates
- **Implementation**: `MONSTER_TEMPLATES` and helper functions
- **Benefits**: Centralized monster creation, easy balancing

### 6. **Facade Pattern**
- **File**: `battle-system.ts`
- **Purpose**: Simple API over complex FSM and event system
- **Implementation**: High-level methods like `runAutoBattle()`
- **Benefits**: Easy integration, hides complexity

## Core Components

### Entity System
```typescript
Entity (abstract)
├── Player
└── Monster
```

**Features**:
- Health management
- Damage calculation
- Combat stats (attack, defense, speed)
- Base stats (strength, dexterity, etc.)

### Battle FSM
Manages state transitions and combat flow:
```
INITIALIZING → TURN_START → PLAYER_TURN/ENEMY_TURN →
PROCESSING_ACTION → CHECKING_VICTORY → (loop or end state)
```

### Event System
Emits typed events for every battle action:
- `BATTLE_START` - Combat begins
- `TURN_START` - New turn begins
- `ATTACK` - Entity attacks
- `DAMAGE` - Damage dealt
- `CRITICAL` - Critical hit
- `DEATH` - Entity defeated
- `VICTORY`/`DEFEAT` - Battle ends
- `LOG` - Human-readable messages

### Event Streaming
Real-time battle updates via ReadableStream:
```typescript
const battle = new BattleSystem(player, monster);
const stream = battle.createEventStream();
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process event
}
```

## Monster Database

10 different monsters with varying stats:
- **Slime** (Lvl 1) - Weak starter enemy
- **Goblin** (Lvl 2) - Fast, low defense
- **Skeleton** (Lvl 3) - Balanced undead
- **Wolf** (Lvl 3) - High speed, moderate damage
- **Orc** (Lvl 4) - High strength, slow
- **Spider** (Lvl 4) - Very fast, moderate health
- **Troll** (Lvl 5) - High HP and defense
- **Dark Knight** (Lvl 6) - Well-rounded strong enemy
- **Demon** (Lvl 7) - High stats across the board
- **Dragon** (Lvl 10) - Boss-tier enemy

## Usage Examples

### Basic Battle
```typescript
import { BattleSystem, Monster, MONSTER_TEMPLATES } from "./engine";

const player = new Player(); // Your player class extending Entity
const goblin = new Monster(MONSTER_TEMPLATES.GOBLIN);
const battle = new BattleSystem(player, goblin);

// Subscribe to events
battle.subscribe((event) => {
  console.log(event);
});

// Run auto-battle
const result = await battle.runAutoBattle();
console.log(`Victory: ${result.victory}, EXP: ${result.expGained}`);
```

### Manual Control
```typescript
battle.start();

while (!battle.isFinished()) {
  if (battle.isWaitingForPlayerInput()) {
    // Player's turn - choose action
    battle.playerAttack();
    // or battle.playerFlee();
  }

  // Process next state
  battle.tick();
}

const result = battle.getResult();
```

### Event Streaming
```typescript
const stream = battle.createEventStream();
const reader = stream.getReader();

// Process events in real-time
(async () => {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    updateUI(value);
  }
})();

await battle.runAutoBattle();
```

## Extensibility

### Adding New Monster
```typescript
// In monster-database.ts
MONSTER_TEMPLATES.NEW_MONSTER = {
  name: "New Monster",
  level: 5,
  stats: { strength: 6, ... },
  baseHealth: 80,
  baseAttack: 15,
  baseDefense: 7,
  baseSpeed: 8,
  expReward: 60,
};
```

### Adding New Battle Action
```typescript
// In battle-fsm.ts
export enum BattleAction {
  ATTACK = "ATTACK",
  DEFEND = "DEFEND",
  FLEE = "FLEE",
  SPECIAL_ABILITY = "SPECIAL_ABILITY", // New action
}

// Add handler in executeAction()
case BattleAction.SPECIAL_ABILITY:
  this.processSpecialAbility();
  break;
```

### Custom Damage Calculation
```typescript
class MagicPlayer extends Entity {
  calculateDamage(target: Entity): number {
    // Custom magic damage formula
    const baseDamage = this.stats.intelligence * 3;
    const resistance = target.stats.willpower;
    return Math.max(1, baseDamage - resistance);
  }
}
```

### New Event Types
```typescript
// In battle-events.ts
export enum BattleEventType {
  // ... existing events
  BUFF_APPLIED = "BUFF_APPLIED",
  DEBUFF_APPLIED = "DEBUFF_APPLIED",
}

export interface BuffEvent extends BaseBattleEvent {
  type: BattleEventType.BUFF_APPLIED;
  target: string;
  buffName: string;
  duration: number;
}
```

## Testing

Run tests:
```bash
bun test src/engine/battle-system.test.ts
```

Run example:
```bash
bun src/engine/battle-example.ts
```

## Architecture Benefits

1. **Maintainable**: Clear separation of concerns
2. **Extensible**: Easy to add new features without breaking existing code
3. **Testable**: Each component can be tested independently
4. **Type-Safe**: Full TypeScript type coverage
5. **Event-Driven**: Decoupled UI from game logic
6. **Predictable**: FSM ensures valid state transitions only

## Future Enhancements

- Status effects (poison, stun, buff/debuff)
- Items and abilities
- Multi-target attacks
- Battle animations timing
- AI difficulty levels
- Party system (multiple allies)
- Turn order queue system
- Critical hit variations
- Elemental damage types
- Equipment and stat modifiers
