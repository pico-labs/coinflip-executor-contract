# Mina zkApp: Coinflip Executor Contract

This repo is part of a submission to [ZK Ignite Cohort 0](https://minaprotocol.com/blog/zkignite-cohort0_), with these related repositories:
- https://github.com/pico-labs/coinflip-frontend
- https://github.com/pico-labs/randomness-oracle

## How to build

```sh
npm run build
```

## How to run tests

```sh
npm run test
npm run testw # watch mode
```

## What does this contract do?

The coinflip executor, straightforwardly, executes coinflips.  The player supplies a number, and the smart contract checks if the number is even or odd.  If even, then the player wins, otherwise the player loses.

<b>The problem</b> with this model is that if the player gets to choose the number themseleves, they would never choose an odd number, and the contract is a static circuit which is not capable of generating a random number.

<b>The solution</b> implemented for this project is to use an oracle for randomness.

### Coinflip Steps
1. The player makes an HTTP request to the randomness oracle, including the public key of the excutor contract
2. The oracle generates a random number, encrypts the value so that the privte key associated with the proviced executor contract can recover the random number
3. The oracle signs the encrypted value so others can verify authenticity, then returns the signed message to the player
4. The player calls `flipCoin` in the executor contract, providing the signed data from the oracle
5. The contract recovers the message, verifies that it was signed by a known, trusted oracle, and calculates whether the random number is even or odd
6. The contract returns the result of the flip, and the plaintext of the random number to the player

This solution works because the player has the right to examine the randomness oracle and decide whether they choose to trust it or not.  If yes, then they can provide a random number to the executor but not be able to frontrun the execution and see if it will succeed or not.  The executor contract is static and verified against the on-chain verification key, meaning that the player can't be scammed by the contract after submitting the number.  The only remaining issue is that if we play for money, then when the player wins, they will get paid by the smart contract, but when the player loses they will not bother to send the money.

<b>The solution</b> to this problem is to use a payment channel.

### Payment Channel Steps
1. The player opens the channel by depositing collateral into the smart contract
2. The player then flips coins as many times as they want, receiving signed balance messages from the contract
	1. Extra benefit of this is scalability - no waiting for blocktimes!
3. When the player has had enough, they withdraw their initial collateral plus or minus the amount that they've won or lost playing the game

## License

[Apache-2.0](LICENSE)
