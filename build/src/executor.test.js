import { isReady, shutdown, Mina, PrivateKey, AccountUpdate, MerkleMap, Field, Poseidon, Circuit, Signature, } from 'snarkyjs';
import { Executor } from './executor';
import { ChannelBalanceProof } from './channelBalanceProof';
await isReady;
await Executor.compile();
describe('executor', () => {
    let executorPrivateKey;
    let executorAddress;
    let deployerPrivateKey;
    let player1PrivateKey;
    beforeEach(async () => {
        const Local = Mina.LocalBlockchain();
        Mina.setActiveInstance(Local);
        executorPrivateKey = PrivateKey.random();
        executorAddress = executorPrivateKey.toPublicKey();
        deployerPrivateKey = Local.testAccounts[0].privateKey;
        player1PrivateKey = Local.testAccounts[1].privateKey;
    });
    afterAll(async () => {
        setTimeout(shutdown, 0);
    });
    // describe('deposit', () => {
    //   it('sets initial balance', async () => {
    //     // setup
    //     const merkleMap = new MerkleMap();
    //     const key = Poseidon.hash(player1PrivateKey.toPublicKey().toFields());
    //     const witness = merkleMap.getWitness(key);
    //     const executor = new Executor(executorAddress);
    //     const tx = await Mina.transaction(deployerPrivateKey, () => {
    //       AccountUpdate.fundNewAccount(deployerPrivateKey);
    //       executor.deploy({ zkappKey: executorPrivateKey });
    //       executor.init();
    //     });
    //     await tx.send();
    //     const executorBalance = Mina.getBalance(executorAddress);
    //     const playerBalance = Mina.getBalance(player1PrivateKey.toPublicKey());
    //     const tx2 = await Mina.transaction(player1PrivateKey, () => {
    //       executor.deposit(
    //         player1PrivateKey.toPublicKey(),
    //         Field(1000),
    //         Field(0),
    //         witness
    //       );
    //     });
    //     await tx2.prove();
    //     tx2.sign([player1PrivateKey]);
    //     await tx2.send();
    //     // test
    //     expect(Mina.getBalance(executorAddress).toString()).toBe(
    //       executorBalance.add(1000).toString()
    //     );
    //     expect(Mina.getBalance(player1PrivateKey.toPublicKey()).toString()).toBe(
    //       playerBalance.sub(1000).toString()
    //     );
    //     const appState = Mina.getAccount(executorAddress).appState;
    //     expect(appState).not.toBeNull();
    //     if (appState) {
    //       merkleMap.set(key, Field(1000));
    //       expect(merkleMap.getRoot().toString()).toBe(appState[0].toString());
    //     } else {
    //       throw new Error('Should not reach this');
    //     }
    //   });
    //   it('increases existing balance', async () => {
    //     // setup
    //     const merkleMap = new MerkleMap();
    //     const key = Poseidon.hash(player1PrivateKey.toPublicKey().toFields());
    //     const witness = merkleMap.getWitness(key);
    //     const executor = new Executor(executorAddress);
    //     const tx = await Mina.transaction(deployerPrivateKey, () => {
    //       AccountUpdate.fundNewAccount(deployerPrivateKey);
    //       executor.deploy({ zkappKey: executorPrivateKey });
    //       executor.init();
    //     });
    //     await tx.send();
    //     const executorBalance = Mina.getBalance(executorAddress);
    //     const playerBalance = Mina.getBalance(player1PrivateKey.toPublicKey());
    //     const tx2 = await Mina.transaction(deployerPrivateKey, () => {
    //       executor.deposit(
    //         player1PrivateKey.toPublicKey(),
    //         Field(1000),
    //         Field(0),
    //         witness
    //       );
    //     });
    //     await tx2.prove();
    //     tx2.sign([player1PrivateKey]);
    //     await tx2.send();
    //     merkleMap.set(key, Field(1000));
    //     const tx3 = await Mina.transaction(deployerPrivateKey, () => {
    //       executor.deposit(
    //         player1PrivateKey.toPublicKey(),
    //         Field(50),
    //         Field(1000),
    //         witness
    //       );
    //     });
    //     await tx3.prove();
    //     tx3.sign([player1PrivateKey]);
    //     await tx3.send();
    //     // test
    //     expect(Mina.getBalance(executorAddress).toString()).toBe(
    //       executorBalance.add(1050).toString()
    //     );
    //     expect(Mina.getBalance(player1PrivateKey.toPublicKey()).toString()).toBe(
    //       playerBalance.sub(1050).toString()
    //     );
    //     const appState = Mina.getAccount(executorAddress).appState;
    //     expect(appState).not.toBeNull();
    //     if (appState) {
    //       merkleMap.set(key, Field(1050));
    //       expect(merkleMap.getRoot().toString()).toBe(appState[0].toString());
    //     } else {
    //       throw new Error('Should not reach this');
    //     }
    //   });
    //   // it('cannot handle multiple updates within the same block', async () => {
    //   //   // setup
    //   //   const merkleMap = new MerkleMap();
    //   //   const key1 = Poseidon.hash(player1PrivateKey.toPublicKey().toFields());
    //   //   const key2 = Poseidon.hash(player2PrivateKey.toPublicKey().toFields());
    //   //   const witness1 = merkleMap.getWitness(key1);
    //   //   const witness2 = merkleMap.getWitness(key2);
    //   //   const executor = new Executor(executorAddress);
    //   //   const tx = await Mina.transaction(deployerPrivateKey, () => {
    //   //     AccountUpdate.fundNewAccount(deployerPrivateKey);
    //   //     executor.deploy({ zkappKey: executorPrivateKey });
    //   //     executor.init();
    //   //   });
    //   //   await tx.send();
    //   //   // test
    //   //   await expect(async () => {
    //   //     const tx2 = await Mina.transaction(deployerPrivateKey, () => {
    //   //       executor.deposit(player1PrivateKey.toPublicKey(), Field(1000), Field(0), witness1)
    //   //       executor.deposit(player2PrivateKey.toPublicKey(), Field(500), Field(0), witness2)
    //   //     });
    //   //     await tx2.prove();
    //   //     tx2.sign([player1PrivateKey, player2PrivateKey]);
    //   //     await tx2.send();
    //   //   }).toThrow();
    //   // });
    // });
    // describe('withdraw', () => {
    //   it('deposits and withdraws', async () => {
    //     // setup
    //     const merkleMap = new MerkleMap();
    //     const key = Poseidon.hash(player1PrivateKey.toPublicKey().toFields());
    //     const witness = merkleMap.getWitness(key);
    //     const executor = new Executor(executorAddress);
    //     const tx = await Mina.transaction(deployerPrivateKey, () => {
    //       AccountUpdate.fundNewAccount(deployerPrivateKey);
    //       executor.deploy({ zkappKey: executorPrivateKey });
    //       executor.init();
    //     });
    //     await tx.send();
    //     const executorBalance = Mina.getBalance(executorAddress);
    //     const playerBalance = Mina.getBalance(player1PrivateKey.toPublicKey());
    //     const tx2 = await Mina.transaction(player1PrivateKey, () => {
    //       executor.deposit(
    //         player1PrivateKey.toPublicKey(),
    //         Field(1000),
    //         Field(0),
    //         witness
    //       );
    //     });
    //     await tx2.prove();
    //     tx2.sign([player1PrivateKey]);
    //     await tx2.send();
    //     merkleMap.set(key, Field(1000));
    //     const tx3 = await Mina.transaction(player1PrivateKey, () => {
    //       executor.withdraw(
    //         player1PrivateKey.toPublicKey(),
    //         Field(1000),
    //         witness
    //       );
    //     });
    //     await tx3.prove();
    //     await tx3.send();
    //     //test
    //     expect(Mina.getBalance(executorAddress).toString()).toBe(
    //       executorBalance.toString()
    //     );
    //     expect(Mina.getBalance(player1PrivateKey.toPublicKey()).toString()).toBe(
    //       playerBalance.toString()
    //     );
    //     const appState = Mina.getAccount(executorAddress).appState;
    //     expect(appState).not.toBeNull();
    //     if (appState) {
    //       merkleMap.set(key, Field(0));
    //       expect(merkleMap.getRoot().toString()).toBe(appState[0].toString());
    //     } else {
    //       throw new Error('Should not reach this');
    //     }
    //   });
    // });
    describe('flipCoin', () => {
        it('flips a coin', async () => {
            // setup
            const merkleMap = new MerkleMap();
            const key = Poseidon.hash(player1PrivateKey.toPublicKey().toFields());
            const witness = merkleMap.getWitness(key);
            const executor = new Executor(executorAddress);
            const tx = await Mina.transaction(deployerPrivateKey, () => {
                AccountUpdate.fundNewAccount(deployerPrivateKey);
                executor.deploy({ zkappKey: executorPrivateKey });
                executor.init();
            });
            await tx.send();
            const tx2 = await Mina.transaction(player1PrivateKey, () => {
                executor.deposit(player1PrivateKey.toPublicKey(), Field(1000), Field(0), witness);
            });
            await tx2.prove();
            tx2.sign([player1PrivateKey]);
            await tx2.send();
            merkleMap.set(key, Field(1000));
            let channelBalance = new ChannelBalanceProof(player1PrivateKey.toPublicKey(), executorAddress);
            let deltaBalance = channelBalance.deltaBalance;
            let channelBalanceSignature = Signature.create(executorPrivateKey, [
                Poseidon.hash(channelBalance.player.toFields()),
                channelBalance.deltaBalance.toField(),
                channelBalance.nonce,
            ]);
            Circuit.runAndCheck(() => {
                const incomingDelta = executor.flipCoin(player1PrivateKey.toPublicKey(), merkleMap.get(key), witness, channelBalance.deltaBalance, channelBalance.nonce, channelBalanceSignature);
                deltaBalance.add(incomingDelta);
                channelBalance.update(incomingDelta);
            });
            console.log(`balance after 1: ${deltaBalance.toJSON()}`);
            channelBalanceSignature = Signature.create(executorPrivateKey, [
                Poseidon.hash(channelBalance.player.toFields()),
                deltaBalance.toField(),
                Field(1),
            ]);
            Circuit.runAndCheck(() => {
                const incomingDelta = executor.flipCoin(player1PrivateKey.toPublicKey(), merkleMap.get(key), witness, channelBalance.deltaBalance, channelBalance.nonce, channelBalanceSignature);
                deltaBalance.add(incomingDelta);
                channelBalance.update(incomingDelta);
            });
            // Circuit.runAndCheck(() => {
            //   channelBalance.deltaBalance = channelBalance.deltaBalance.add(100); // try to cheat
            //   // should fail
            //   executor.flipCoin(
            //     player1PrivateKey.toPublicKey(),
            //     merkleMap.get(key),
            //     witness,
            //     channelBalance.deltaBalance,
            //     channelBalance.nonce,
            //     channelBalanceSignature
            //   )
            // });
        });
    });
});
//# sourceMappingURL=executor.test.js.map