# Migration Guide: React State → Effect + @effect/atom

This guide shows how to migrate from React's built-in state management to Effect + @effect/atom.

## Quick Reference

| From | To | Notes |
|------|-----|-------|
| `useState` | `Atom.make + useAtomValue/useAtomSet` | Reactive atoms |
| `useRef` | `Atom.make` | For reactive data only |
| `useReducer` | Computed atoms | Derive state from atoms |
| `useEffect` | `useEffectSubscription` / `useFiber` | Better cleanup |
| `setInterval` | `Effect.repeat + Schedule` | Composable, testable |
| `Context.Provider` | Global atoms | No prop drilling |

## Pattern Migrations

### 1. useState → Atom.make

**Before:**
```typescript
const [count, setCount] = useState(0);
const increment = () => setCount(count + 1);
```

**After:**
```typescript
const countAtom = Atom.make(0);

function MyComponent() {
  const count = useAtomValue(countAtom);
  const setCount = useAtomSet(countAtom);
  const increment = () => setCount(count + 1);
}
```

### 2. useRef → Atom.make

**Before:**
```typescript
const battleRef = useRef<BattleSystem | null>(null);
battleRef.current = newBattle;
forceRender(); // Manual re-render!
```

**After:**
```typescript
const battleAtom = Atom.make<BattleSystem | null>(null);

function MyComponent() {
  const battle = useAtomValue(battleAtom); // Auto re-renders!
  const setBattle = useAtomSet(battleAtom);
  setBattle(newBattle); // Updates UI automatically
}
```

### 3. useEffect → useEffectSubscription

**Before:**
```typescript
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, [deps]);
```

**After:**
```typescript
useEffectSubscription(
  Effect.gen(function* () {
    yield* subscribeEffect();
  }),
  [deps]
);
```

### 4. setInterval → Effect.repeat

**Before:**
```typescript
const intervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  intervalRef.current = setInterval(() => {
    tick();
  }, 1000);

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);
```

**After:**
```typescript
const tickEffect = Effect.gen(function* () {
  yield* tickLogic();
}).pipe(
  Effect.repeat(Schedule.spaced(Duration.seconds(1)))
);

useFiber(tickEffect, []); // Auto-cleanup!
```

### 5. Computed State → Computed Atoms

**Before:**
```typescript
const [a, setA] = useState(0);
const [b, setB] = useState(0);
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(a + b); // Manual sync
}, [a, b]);
```

**After:**
```typescript
const aAtom = Atom.make(0);
const bAtom = Atom.make(0);
const totalAtom = Atom.readable((get) => {
  return get(aAtom) + get(bAtom); // Auto-sync!
});
```

### 6. Lazy Initialization

**Before:**
```typescript
const [player, setPlayer] = useState<Player | null>(null);

useEffect(() => {
  const p = new Player();
  p.name = "Hero";
  setPlayer(p);
}, []); // Runs every render if deps missing!
```

**After:**
```typescript
const playerAtom = Atom.make(() => {
  const p = new Player();
  p.name = "Hero";
  return p; // Created only once!
});
```

## Complete Migration Example: BattleTestPage

See `/src/pages/BattleTestPage.old.tsx` vs `/src/pages/BattleTestPage.tsx` for a real-world example.

**Changes:**
- Removed 5 useState hooks → Atoms
- Removed 6 useRef hooks → Atoms
- Removed 1 useReducer → Atoms handle reactivity
- Removed 1 useEffect cleanup → useFiber handles it
- Removed setInterval → Effect.repeat in BattleManager
- Removed manual forceRender → Atoms auto-update

**Result:**
- 200+ lines reduced to ~150 lines
- No manual cleanup needed
- No race conditions
- Fully testable with Effect
- Type-safe throughout

## Step-by-Step Migration Process

1. **Install dependencies** (already done)
   ```bash
   bun add effect @effect-atom/atom-react @effect/platform @effect/platform-browser
   ```

2. **Create foundation** (already done)
   - `/src/hooks/useEffectSubscription.ts`
   - `/src/state/atomRuntime.ts`

3. **Migrate simple components first**
   - MainMenu.tsx ✓
   - NewGamePage.tsx ✓
   - CharacterPage.tsx ✓

4. **Migrate complex components**
   - BattleTestPage.tsx ✓

5. **Run tests**
   ```bash
   bun test
   ```

6. **Verify types**
   ```bash
   bun x tsc -b
   ```

7. **Check quality**
   ```bash
   bun run check
   ```

## Common Migration Mistakes

### ❌ Don't create atoms in components

```typescript
function MyComponent() {
  const atom = Atom.make(0); // Creates new atom every render!
}
```

✅ Create at module level:
```typescript
const myAtom = Atom.make(0);

function MyComponent() {
  const value = useAtomValue(myAtom);
}
```

### ❌ Don't mix React state with atoms

```typescript
const [a, setA] = useState(0); // ❌
const b = useAtomValue(bAtom); // ✓
```

✅ Use only atoms:
```typescript
const a = useAtomValue(aAtom); // ✓
const b = useAtomValue(bAtom); // ✓
```

### ❌ Don't forget cleanup

```typescript
Effect.runFork(longEffect); // Leaks!
```

✅ Use hooks:
```typescript
useFiber(longEffect, []); // Auto-cleanup
```

## Testing After Migration

```typescript
// Old way (hard to test)
test("increments counter", () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](1));
  expect(result.current[0]).toBe(1);
});

// New way (easy to test)
test("increments counter", async () => {
  const program = Effect.gen(function* () {
    yield* Atom.set(countAtom, 1);
    return yield* Atom.get(countAtom);
  });

  const result = await Effect.runPromise(program);
  expect(result).toBe(1);
});
```

## Next Steps

1. Review [EFFECT_PATTERNS.md](./EFFECT_PATTERNS.md) for best practices
2. Check [ATOMS_API.md](./ATOMS_API.md) for API reference
3. Run the application and test battle system
4. Write tests for your components

## Support

If you encounter issues during migration:
- Check Effect documentation: https://effect.website/
- Review existing migrated components for patterns
- Consult the team
