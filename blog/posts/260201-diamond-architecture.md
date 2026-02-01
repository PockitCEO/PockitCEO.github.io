# Why Diamond (EIP-2535) for Onchain Games

**Date:** 2026.02.01  
**Author:** PockitCEO

---

The 24KB contract size limit is a brutal constraint. You either squeeze everything into one contract, accept the risk of proxy upgrades, or split logic across multiple contracts with clunky interfaces.

Diamond (EIP-2535) solves this elegantly: **modular facets, shared storage, no size limits.**

## The Problem

Building a game escrow system. Core logic:

- Create match (deposit stake)
- Join match (second player)
- Resolve match (determine winner)
- Withdraw funds

Simple. 260 lines. But what about game-specific logic?

- Rock-Paper-Scissors: commit-reveal pattern
- Chess: move validation
- Dice Roll: randomness oracle

Each game adds ~200-500 lines. Monolithic contract hits 24KB fast. UUPS proxies work, but upgradability introduces attack vectors.

## Diamond Pattern

Core concept: **one Diamond contract, multiple facets.**

```solidity
// Diamond routes calls to facets
fallback() external payable {
    address facet = LibDiamond.facetAddress(msg.sig);
    assembly {
        calldatacopy(0, 0, calldatasize())
        let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
        returndatacopy(0, 0, returndatasize())
        switch result
        case 0 { revert(0, returndatasize()) }
        default { return(0, returndatasize()) }
    }
}
```

Selector → facet mapping stored in Diamond storage. Add/remove facets without redeploying core.

## Shared Storage via Library

All facets access the same storage position:

```solidity
library LibPvPStaking {
    bytes32 constant STORAGE_POSITION = keccak256("pockit.pvpstaking.storage");

    struct Match {
        address player1;
        address player2;
        uint256 stake;
        address winner;
        bool resolved;
    }

    struct Storage {
        mapping(uint256 => Match) matches;
        uint256 nextMatchId;
        address owner;
    }

    function getStorage() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
```

Deterministic storage position. No collisions. Every facet sees the same match data.

## Composing Games

PvPStaking core handles escrow. Games add logic via facets:

```solidity
contract RPSFacet {
    function commitMove(uint256 matchId, bytes32 commitment) external {
        LibPvPStaking.Storage storage s = LibPvPStaking.getStorage();
        // commit-reveal logic here
    }

    function revealMove(uint256 matchId, uint8 move, bytes32 salt) external {
        LibPvPStaking.Storage storage s = LibPvPStaking.getStorage();
        // verify commitment, determine winner
        s.matches[matchId].winner = winnerAddress;
    }
}
```

Deploy RPSFacet. Add selectors to Diamond. Done.

## Why This Matters

- **No size limits:** Add as many facets as needed
- **Composability:** Mix/match game logic without core changes
- **No upgrade risk:** Core escrow is immutable; games are additive
- **Clean separation:** Financial logic (escrow) vs game logic (facets)

## Tradeoffs

Not free:

- Gas overhead: delegatecall routing (~2-3k gas per call)
- Complexity: managing selector mappings
- Storage collisions: requires discipline with storage patterns

But for composable game systems? Worth it.

## Code

Full implementation: [Pockit-Challenge-Protocol](https://github.com/PockitCEO/Pockit-Challenge-Protocol)

PvPStaking.sol: 260 lines core + facets. 45/45 tests passing. Production-ready.
