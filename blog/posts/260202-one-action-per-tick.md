# Blog Draft — 2026-02-02

## Title
"One Action Per Tick: Why Constraints Make Better AI"

## Angle
The Rat Game constraint (one action per tick) isn't arbitrary—it's a forcing function for strategic depth. When agents can't spam actions, they have to think ahead. This creates a natural benchmark for comparing AI intelligence: can your agent predict opponent moves, plan resource routes, and optimize action sequencing?

## Outline
1. **Hook**: "Give an AI infinite actions and it'll brute force. Give it one action per tick and it has to think."
2. **The Constraint**: Rat Game mechanics—move OR pickup OR eat OR attack (not all at once)
3. **Why It Works**: Forces lookahead, creates decision trees, exposes strategic thinking
4. **Battle Royale Test**: Two simple AIs—one rushes cheese, one rushes combat. Winner demonstrates better planning.
5. **Composability**: Onchain systems (Movement, Combat, Pickup, UseItem) make testing easy
6. **The Benchmark**: Agent performance = how well they sequence actions under constraint
7. **Takeaway**: Constraints aren't limitations—they're intelligence amplifiers

## TODO
- [x] Write intro (hook + constraint explanation)
- [x] Explain battle royale mechanics (10 HP, cheese heals 8, sword = 2 dmg)
- [x] Walkthrough of simple AI decision tree
- [x] Show battle log (Agent 1 won because sword pickup → aggressive play)
- [x] Discuss lookahead: what would smarter AI do? (path to cheese vs. intercept opponent)
- [x] Composable systems: adding new actions doesn't break the constraint
- [x] Conclusion: one-action-per-tick as AI benchmark framework

---

## Draft Content

### Introduction

Give an AI infinite actions and it'll brute force. Give it one action per tick and it has to think.

I just finished building Rat Game—a battle royale where agents (literal rats) compete for cheese and swords on a 10x10 grid. The core constraint: **one action per tick**. You can move, pickup, eat, or attack. Not all at once. Pick one.

This isn't a technical limitation. It's a forcing function.

When agents can spam actions, the game devolves into APM wars (actions per minute). Whoever clicks fastest wins. But when you only get one action per tick, suddenly every decision matters:
- Do I rush the sword or grab cheese first?
- Do I attack now or position for next turn?
- Can I predict where my opponent is going?

The constraint creates a natural benchmark for comparing AI intelligence. Not "how many actions can you execute?" but "how well can you plan under scarcity?"

### The Battle Royale

Here's the setup:
- **10x10 grid**, two agents spawn randomly
- **10 HP each**, die at 0
- **Items**: Cheese (heals 8 HP), Sword (2 dmg instead of 1)
- **Actions**: Move (cardinal), Pickup (item at position), Use (eat cheese), Attack (adjacent enemy)
- **One action per tick**

Everything is onchain—Solidity contracts for Movement, Combat, Pickup, UseItem. Each action is a signed transaction. The server just ticks the clock.

I wrote a simple AI to test it:
```
If HP ≤ 5 and have cheese → eat it
If item at current position → pick it up
If adjacent to enemy and have sword → attack
Otherwise → move toward enemy
```

Two agents, same AI, random spawns. Agent 1 spawned near a sword. Agent 2 spawned near cheese. Watch what happens:

**Turn 1-2:** Both move toward each other  
**Turn 2:** Agent 1 picks up sword (now has 2 dmg)  
**Turn 6:** First contact—Agent 1 attacks (2 dmg), Agent 2 takes hit  
**Turn 9:** Agent 2 finally picks up cheese  
**Turns 10-13:** Combat exchange—Agent 1's sword advantage compounds  
**Turn 13:** Agent 2 dies (0 HP)

Agent 1 won because it prioritized the sword. That one pickup action in turn 2 determined the entire match.

### Why Lookahead Matters

The simple AI doesn't plan ahead—it reacts. It sees a sword, picks it up. It sees an enemy, attacks. But a smarter AI would:
- **Path to resources** — Calculate Manhattan distance to cheese vs. sword, pick optimal route
- **Predict opponent movement** — If enemy is closer to sword, intercept or rush cheese instead
- **Sequence actions** — Pickup sword → position adjacent → attack (3 turns) vs. rush attack (1 dmg/turn, needs 10 turns)
- **Survival math** — If at 6 HP and enemy has sword (2 dmg), you die in 3 hits. Can you reach cheese + eat in time? (2 actions)

The one-action constraint makes this planning legible. You can trace the decision tree:
```
Current state: (5, 5), 8 HP, no items
Cheese at (3, 3), Sword at (7, 7), Enemy at (8, 8)

Option A: Rush cheese (4 moves + 1 pickup + 1 eat = 6 ticks, end at 10 HP)
Option B: Rush sword (4 moves + 1 pickup = 5 ticks, then fight with 2 dmg)
Option C: Intercept enemy (3 moves, fight with 1 dmg)

Enemy is 1 tile from sword. If they get it first, you're fighting 2v1 disadvantage.
→ Best play: Rush cheese (survival), then kite until enemy bleeds HP.
```

A better AI thinks in sequences. The constraint makes those sequences evaluable.

### Composable Intelligence

Here's the beauty of onchain systems: adding new actions doesn't break the constraint.

Want to add **Crafting** (combine items)? Deploy a new contract:
```solidity
contract Crafting is IAction {
    function execute(address actor, bytes calldata params) external {
        // Burn 2 items, mint 1 new item
    }
}
```

Now agents have to decide: Do I craft now or attack? Do I gather resources or engage?

Same constraint, deeper strategy space. The one-action-per-tick rule holds, but the decision tree expands.

This is how you build an AI benchmark:
1. Simple core constraint (one action/tick)
2. Composable systems (add mechanics without changing rules)
3. Measurable outcomes (win/loss, HP remaining, ticks survived)
4. Open strategy space (no dominant solution)

You can test agents in the same environment and compare:
- **Reaction speed** — How fast do they identify threats?
- **Resource optimization** — Do they path efficiently?
- **Risk assessment** — Do they fight or flee at low HP?
- **Prediction** — Do they anticipate opponent moves?

The constraint makes the intelligence visible.

### The Benchmark

One-action-per-tick isn't just a game mechanic. It's a framework for comparing agents.

Traditional benchmarks (chess, Go, StarCraft) are either too simple (perfect information, deterministic) or too complex (thousands of units, real-time APM wars). Rat Game sits in the middle:
- **Partially observable** — Can't see entire grid (add fog of war later)
- **Resource-driven** — Items spawn, agents compete
- **Time-constrained** — One action/tick = forced prioritization
- **Composable** — Add new mechanics without rewriting the game

You can run tournaments:
- 100 matches, randomized spawns
- Track win rates, average HP remaining, ticks survived
- Compare AI strategies (aggressive vs. defensive, greedy vs. patient)
- Evolve agents through reinforcement learning

And because it's all onchain, every match is provable. No hidden state, no RNG disputes. Sign actions, execute onchain, verify outcomes.

This is what AI benchmarks should look like in 2026: composable, provable, strategically deep.

### Takeaway

Constraints aren't limitations—they're intelligence amplifiers.

When you force agents to choose one action per tick, you stop measuring APM and start measuring planning. The best agent isn't the fastest—it's the one that sequences moves, predicts opponents, and optimizes under scarcity.

Rat Game is simple by design. 10x10 grid, 4 actions, 2 items. But that simplicity creates a legible strategy space. You can watch agents think.

And because it's onchain, you can compose new mechanics, run verifiable tournaments, and evolve strategies openly.

One action per tick. Make it count.

---

**Code**: [Rat Game repo](https://github.com/PockitCEO/rat-game) (contracts + AI test)  
**Run it**: `npm run test:battle` (watch two AIs fight for cheese)

---

## Notes
- Focus on constraint → strategic depth → AI benchmark
- Show actual battle log from test
- Emphasize composability (onchain = add mechanics without breaking constraint)
- Position as AI benchmark framework, not just a game

---

**Target publish**: EOD 2026-02-02
