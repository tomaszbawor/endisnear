# Effect + @effect/atom Patterns

This document describes the patterns used for state management and side effects in this project using Effect and @effect/atom instead of React's built-in hooks.

## Why Effect + @effect/atom?

### Advantages

1. **Functional Composition**: Effect provides composable, type-safe operations
2. **Atomic State**: Atoms ensure consistent state updates across the application
3. **Better Testing**: Effect code is easier to test than imperative code
4. **Resource Safety**: Automatic cleanup with Effect fibers and scopes
5. **Schema Validation**: Built-in validation with Effect Schema
6. **LocalStorage Integration**: Automatic persistence with KeyValueStore

### Replaced React Patterns

| React Pattern | Effect/Atom Pattern |
|--------------|---------------------|
| useState | Atom.make |
| useRef | Atom.make (for reactive data) |
| useReducer | Computed atoms |
| useEffect | useEffectSubscription / useFiber |
| setInterval | Effect.repeat + Schedule |
| Context API | Global atoms with atomRuntime |

## Atom Patterns

### 1. Global Atoms (Persistent State)

Used for application-wide state that should persist across sessions.

```typescript
// With Schema validation and localStorage persistence
export const gameConfigAtom = Atom.kvs({
  runtime: atomRuntime,
  key: "ein-settings",
  schema: GameSettingsSchema,
  defaultValue: () => ({
    volume: 50,
    isFullscreen: true,
  }),
});

// Usage in components
const settings = useAtomValue(gameConfigAtom);
const setSettings = useAtomSet(gameConfigAtom);
```

**Benefits:**
- Auto-persists to localStorage
- Schema validation ensures type safety
- Shared across all components
- No prop drilling needed

### 2. Computed Atoms (Derived State)

Used for state derived from other atoms.

```typescript
// Computed from gameSavesAtom
export const hasSaveAtom = Atom.readable((get) => {
  const saves = get(gameSavesAtom);
  return saves.some((save) => save !== null);
});

// Usage
const hasSave = useAtomValue(hasSaveAtom); // Auto-updates when gameSavesAtom changes
```

**Benefits:**
- No manual synchronization
- Always consistent
- Memoized automatically
- Read-only (prevents accidental mutation)

### 3. Local Component Atoms

Used for component-specific transient state.

```typescript
// Module-level atom (resets on page reload)
const selectedSlotAtom = Atom.make<number | null>(null);

export default function NewGamePage() {
  const selectedSlot = useAtomValue(selectedSlotAtom);
  const setSelectedSlot = useAtomSet(selectedSlotAtom);

  // Use like useState but with atom benefits
}
```

**When to use:**
- Form inputs
- UI-only state (modals, selected items)
- State that doesn't need persistence
- Page-specific state

### 4. Lazy Initialization Atoms

Used when initial value requires computation.

```typescript
const playerAtom = Atom.make(() => {
  const player = new Player();
  player.name = "Josh";
  return player;
});

// Player is only created once, when atom is first accessed
const player = useAtomValue(playerAtom);
```

**Benefits:**
- Computed only once
- No useEffect needed
- Cleaner than useState + useEffect
- Fixes initialization anti-patterns

## Effect Integration Patterns

### 1. Effect Subscriptions

Use `useEffectSubscription` for running Effects in component lifecycle.

```typescript
// Run an Effect when component mounts
useEffectSubscription(
  Effect.gen(function* () {
    yield* Effect.log("Component mounted");
    yield* someEffect();
  }),
  [] // Empty deps = run once on mount
);
```

**Cleanup:** Effect fibers are automatically interrupted on unmount.

### 2. Fiber Management

Use `useFiber` for long-running background tasks.

```typescript
const battleLoop = Effect.gen(function* () {
  // Battle logic here
}).pipe(
  Effect.repeat(Schedule.spaced("500 millis"))
);

// Automatically starts fiber on mount, stops on unmount
const fiber = useFiber(battleLoop, [battleId]);
```

**Benefits:**
- Automatic cleanup
- Interruptible
- Composable with other Effects
- Better than setInterval

### 3. Stream Consumption

Use `useStream` to consume Effect Streams.

```typescript
const eventStream = battle.getEventStream();
const latestEvent = useStream(eventStream);

if (latestEvent) {
  console.log("New event:", latestEvent);
}
```

## Battle System Integration

### Architecture

```
BattleSystem (Pure Effect logic)
  ↓
BattleManager (Effect service with callbacks)
  ↓
React Component (Updates atoms via callbacks)
  ↓
UI (Reads from atoms with useAtomValue)
```

### BattleManager Pattern

```typescript
// Create BattleManager with callbacks
const manager = yield* BattleManager.make(battle, turnSpeed, {
  onEventLog: (formattedEvent) => {
    setBattleEvents((prev) => [...prev, formattedEvent].slice(-20));
  },
  onBattleFinish: () => {
    setBattleState((current) =>
      current ? { ...current, isRunning: false } : null
    );
  },
});

// Start the battle
yield* manager.start(); // Starts fibers internally

// Stop the battle
yield* manager.stop(); // Interrupts fibers
```

**Key Points:**
- BattleManager doesn't directly manipulate atoms (separation of concerns)
- Callbacks update atoms from React component
- Effect handles all async orchestration
- Clean fiber lifecycle management

## Best Practices

### DO ✅

1. **Use atoms for all state**
   ```typescript
   const [count, setCount] = useAtomValue(countAtom) // ✅
   ```

2. **Use computed atoms for derived state**
   ```typescript
   const totalAtom = Atom.readable((get) => {
     return get(aAtom) + get(bAtom);
   });
   ```

3. **Use Effect for async operations**
   ```typescript
   const result = yield* Effect.tryPromise(() => fetch(...));
   ```

4. **Clean up resources with Effect fibers**
   ```typescript
   useFiber(backgroundTask, [deps]); // Auto-cleanup
   ```

### DON'T ❌

1. **Don't use useState**
   ```typescript
   const [state, setState] = React.useState() // ❌
   ```

2. **Don't use useEffect for subscriptions**
   ```typescript
   React.useEffect(() => {
     const sub = subscribe();
     return () => sub.unsubscribe();
   }, []) // ❌ Use useEffectSubscription instead
   ```

3. **Don't use setInterval**
   ```typescript
   setInterval(() => tick(), 1000) // ❌ Use Effect.repeat
   ```

4. **Don't create atoms in render**
   ```typescript
   function MyComponent() {
     const atom = Atom.make(0) // ❌ Create outside component
   }
   ```

## Testing Patterns

### Testing Atoms

```typescript
test("atom updates correctly", async () => {
  const program = Effect.gen(function* () {
    yield* Atom.set(myAtom, "new value");
    const value = yield* Atom.get(myAtom);
    return value;
  });

  const result = await Effect.runPromise(program);
  expect(result).toBe("new value");
});
```

### Testing Effect Code

```typescript
test("battle manager starts and stops", async () => {
  const program = Effect.gen(function* () {
    const battle = yield* BattleSystem.make(hero, monster);
    const manager = yield* BattleManager.make(battle, 100, callbacks);

    yield* manager.start();
    yield* Effect.sleep("500 millis");
    yield* manager.stop();

    return "success";
  });

  const result = await Effect.runPromise(program);
  expect(result).toBe("success");
});
```

## Common Pitfalls

### 1. Forgetting to provide runtime

**Problem:**
```typescript
Atom.set(myAtom, value) // ❌ Missing runtime context
```

**Solution:** Use within React components with useAtomSet, or provide runtime explicitly.

### 2. Creating atoms in render

**Problem:**
```typescript
function Component() {
  const atom = Atom.make(0) // ❌ Creates new atom on every render
}
```

**Solution:** Create atoms outside the component.

### 3. Not cleaning up fibers

**Problem:**
```typescript
Effect.runFork(longRunningEffect) // ❌ No cleanup
```

**Solution:** Use useFiber for automatic cleanup.

### 4. Mixing React state with atoms

**Problem:**
```typescript
const [count, setCount] = useState(0);
const atom Value = useAtomValue(countAtom);
// Now you have two sources of truth! ❌
```

**Solution:** Use only atoms.

## Migration Checklist

- [ ] Replace all useState with Atom.make
- [ ] Replace all useRef with Atom.make (for reactive data)
- [ ] Replace all useReducer with computed atoms
- [ ] Replace all useEffect with useEffectSubscription/useFiber
- [ ] Replace all setInterval with Effect.repeat
- [ ] Remove all forceRender hacks
- [ ] Test with `bun test`
- [ ] Verify with `bun x tsc -b`
- [ ] Lint with `bun run check`

## Resources

- [Effect Documentation](https://effect.website/)
- [@effect/atom Documentation](https://github.com/Effect-TS/atom)
- [Effect Schema](https://effect.website/docs/schema/introduction)
- [Project Migration Guide](./MIGRATION_GUIDE.md)
- [Atoms API Reference](./ATOMS_API.md)
