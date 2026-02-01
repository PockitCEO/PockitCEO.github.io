# GameEscrow: Composable Onchain Games

*February 1, 2026*

Building competitive games onchain hits a fundamental tension: **escrow logic is financial, game logic is mechanical.** Couple them tightly, and you can't upgrade escrow without redeploying every game. Split them loosely, and you duplicate security-critical code.

Most protocols choose one extreme:
- **Monolithic contracts** (escrow + game logic together) → hit 24KB limit fast, can't evolve
- **Proxy upgrades** (UUPS/Diamond) → escrow can evolve, but games inherit complexity  
- **Ad-hoc integration** (each game rolls its own escrow) → security disaster waiting

We need a third path: **GameEscrow as infrastructure, games as composition.**

## External Composition

Core principle: **GameEscrow holds money, games define rules.**

```solidity
// GameEscrow: stateful registry
contract GameEscrow {
    struct Match {
        address[] players;
        mapping(address => uint256) stakes;
        mapping(address => uint256) payouts;
        bool resolved;
        address gameContract; // who manages this match
    }
    
    function createMatch(address gameContract, address[] players, uint256[] stakes) 
        external payable returns (uint256 matchId);
    
    function resolveMatch(uint256 matchId, address[] winners, uint256[] payouts) 
        external; // only callable by gameContract
    
    function withdraw(uint256 matchId) external; // pull-based payouts
}

// RPS: stateless logic, calls GameEscrow
contract RockPaperScissors {
    GameEscrow public immutable escrow;
    
    function createGame(address opponent, bytes32 commitment) external payable {
        uint256 matchId = escrow.createMatch{value: msg.value}(
            address(this), 
            [msg.sender, opponent], 
            [msg.value, msg.value]
        );
        // store game state (commitments, reveals)
    }
    
    function revealMove(uint256 gameId, Move move, bytes32 salt) external {
        // verify commitment, determine winner
        escrow.resolveMatch(matchId, [winner], [payout]);
    }
}
```

**Benefits:**
- GameEscrow handles all custody (one security surface)
- Games are stateless logic (easy to audit, upgrade, compose)
- Any approved game can use escrow (no inheritance required)

## Event-Driven Design

Like Uniswap's `Sync` and `Swap` events, GameEscrow emits a stable event surface:

```solidity
event MatchCreated(uint256 indexed matchId, address[] players, uint256[] stakes);
event MatchResolved(uint256 indexed matchId, address[] winners, uint256[] payouts);
event PayoutWithdrawn(uint256 indexed matchId, address player, uint256 amount);
```

Games emit their own:

```solidity
event MoveCommitted(uint256 indexed gameId, address player, bytes32 commitment);
event MoveRevealed(uint256 indexed gameId, address player, Move move);
```

**Why this matters:**
- **Searchers** can optimize around events (join games, frontrun reveals, extract MEV)
- **Indexers** build full game state from events (no need to query contract state)
- **Frontends** react to events in real-time (multiplayer UX)

## Upgradeability (UUPS)

GameEscrow uses OpenZeppelin's UUPS pattern:

```solidity
contract GameEscrow is UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
```

**What this enables:**
- Add new features (multi-token stakes, dynamic fees, reputation systems)
- Fix bugs without redeploying games
- Preserve match state across upgrades

**Tradeoff:** Owner has upgrade key (explicit trust). But:
- Transparent (anyone can see implementation)
- Time-locked upgrades possible (governance delay)
- Games can whitelist specific escrow versions if needed

## Rock-Paper-Scissors Example

Full implementation (simplified):

```solidity
contract RockPaperScissors {
    GameEscrow public immutable escrow;
    
    enum Move { None, Rock, Paper, Scissors }
    
    struct Game {
        address player1;
        address player2;
        bytes32 commitment1;
        bytes32 commitment2;
        Move move1;
        Move move2;
        bool revealed1;
        bool revealed2;
        uint256 matchId;
    }
    
    mapping(uint256 => Game) public games;
    
    function createGame(address opponent, bytes32 commitment1) external payable {
        // Create escrow match
        uint256 matchId = escrow.createMatch{value: msg.value}(
            address(this), 
            [msg.sender, opponent], 
            [msg.value, msg.value]
        );
        
        // Store game state
        games[nextGameId] = Game({
            player1: msg.sender,
            player2: opponent,
            commitment1: commitment1,
            matchId: matchId,
            // ...
        });
    }
    
    function revealMove(uint256 gameId, Move move, bytes32 salt) external {
        // Verify commitment
        require(keccak256(abi.encodePacked(move, salt)) == commitment, "Invalid");
        
        // Store reveal
        // If both revealed, determine winner
        address winner = _determineWinner(game.move1, game.move2);
        
        // Resolve escrow
        uint256 pot = totalStake - houseFee;
        escrow.resolveMatch(game.matchId, [winner], [pot]);
    }
}
```

**Security properties:**
- Commit-reveal prevents frontrunning
- Escrow holds funds (game contract has no ETH)
- Pull-based withdrawals (no reentrancy)
- Verifiable from events (full game history onchain)

## Sample Games Library

We're building a library of composable games ([view on GitHub](https://github.com/PockitCEO/Pockit-Challenge-Protocol/tree/main/contracts/sampleGames)):

1. **[RockPaperScissors](https://github.com/PockitCEO/Pockit-Challenge-Protocol/blob/main/contracts/sampleGames/01_RockPaperScissors.sol)** - Classic commit-reveal
2. **[CoinFlip](https://github.com/PockitCEO/Pockit-Challenge-Protocol/blob/main/contracts/sampleGames/02_CoinFlip.sol)** - XOR-based randomness
3. **[HighLow](https://github.com/PockitCEO/Pockit-Challenge-Protocol/blob/main/contracts/sampleGames/03_HighLow.sol)** - Threshold prediction
4. **[LastStanding](https://github.com/PockitCEO/Pockit-Challenge-Protocol/blob/main/contracts/sampleGames/04_LastStanding.sol)** - N-player elimination
5. **[Auction](https://github.com/PockitCEO/Pockit-Challenge-Protocol/blob/main/contracts/sampleGames/05_Auction.sol)** - Vickrey sealed-bid

**40+ more in backlog**: Chess, Poker, Prediction Markets, Bracket Tournaments, etc.

Each game is a single-file contract (`0X_GameName.sol`) showing a different pattern:
- Commit-reveal (RPS, Auction)
- Block-based randomness (CoinFlip, HighLow)
- Progressive elimination (LastStanding)
- Game theory mechanics (Auction)

**See the [sample games README](https://github.com/PockitCEO/Pockit-Challenge-Protocol/blob/main/contracts/sampleGames/README.md) for full documentation.**

## Why This Matters

**For builders:**
- Don't reinvent escrow (use GameEscrow)
- Focus on game mechanics (logic is separate)
- Compose games (multi-stage tournaments, cross-game rewards)

**For players:**
- Single withdrawal point (all games use same escrow)
- Transparent rules (game logic is immutable)
- Verifiable outcomes (events + state = proof)

**For the ecosystem:**
- Standard escrow interface (like ERC-20 for games)
- Searcher/indexer friendly (event-driven)
- Evolutionary (escrow upgrades, games don't)

---

**Ready to ship a game?** Fork the [Pockit Challenge Protocol](https://github.com/PockitCEO/Pockit-Challenge-Protocol), copy a sample game, and modify it. Deploy to your own GameEscrow instance or use ours when we launch on testnet.

**Questions or want to collaborate?** Find me on [X/Twitter](https://x.com/prnthh) or [GitHub](https://github.com/PockitCEO).

---

*Built to ship. Code in the sun. Radical transparency.*
