import {
  isReady,
  shutdown,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  MerkleMap,
  Field,
  Poseidon,
  Circuit,
  Signature,
  Encryption,
  Int64,
} from 'snarkyjs';

import { Executor } from './executor';
import { ChannelBalanceProof } from './channelBalanceProof';

await isReady;
await Executor.compile();

describe('executor', () => {
  let executorPrivateKey: PrivateKey;
  let executorAddress: PublicKey;

  let deployerPrivateKey: PrivateKey;
  let player1PrivateKey: PrivateKey;

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

  // describe('addCollateral', () => {
  //   it('adds first collateral', async () => {
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
  //       executor.addCollateral(
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

  //   it('adds another round of collateral', async () => {
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
  //       executor.addCollateral(
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
  //       executor.addCollateral(
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
  // });

  // describe('removeCollateral', () => {
  //   it('adds and removes collateral', async () => {
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
  //       executor.addCollateral(
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

  //     const channelBalanceSignature = Signature.create(executorPrivateKey, [
  //       Poseidon.hash(player1PrivateKey.toPublicKey().toFields()),
  //       Int64.from(0).toField(),
  //       Field(0),
  //     ]);

  //     console.log('try');
  //     const tx3 = await Mina.transaction(player1PrivateKey, () => {
  //       executor.removeCollateral(
  //         player1PrivateKey.toPublicKey(),
  //         Field(1000),
  //         witness,
  //         Int64.from(0),
  //         Field(0),
  //         channelBalanceSignature
  //       );
  //     });
  //     await tx3.prove();
  //     await tx3.send();

  //     console.log('succeed');
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
      const oraclePrivateKey = PrivateKey.random();
      const oraclePublicKey = oraclePrivateKey.toPublicKey();

      const tx = await Mina.transaction(deployerPrivateKey, () => {
        AccountUpdate.fundNewAccount(deployerPrivateKey);
        executor.deploy({ zkappKey: executorPrivateKey });
        executor.init();
        const update = AccountUpdate.create(deployerPrivateKey.toPublicKey());
        update.send({ to: executorAddress, amount: 1_000_000 });
        update.requireSignature();
      });
      tx.sign([deployerPrivateKey]);
      await tx.send();

      const extraTx = await Mina.transaction(deployerPrivateKey, () => {
        executor.updateRandomnessOracle(executorPrivateKey, oraclePublicKey);
      });
      await extraTx.prove();
      await extraTx.send();

      const tx2 = await Mina.transaction(player1PrivateKey, () => {
        executor.addCollateral(
          player1PrivateKey.toPublicKey(),
          Field(1000),
          Field(0),
          witness
        );
      });
      await tx2.prove();
      tx2.sign([player1PrivateKey]);
      await tx2.send();

      merkleMap.set(key, Field(1000));

      let channelBalance = new ChannelBalanceProof(
        player1PrivateKey.toPublicKey(),
        executorAddress
      );

      let deltaBalance = channelBalance.deltaBalance;

      let channelBalanceSignature = Signature.create(executorPrivateKey, [
        Poseidon.hash(channelBalance.player.toFields()),
        channelBalance.deltaBalance.toField(),
        channelBalance.nonce,
      ]);

      let incomingDelta: Int64;
      let randomNumber: Field;
      Circuit.runAndCheck(() => {
        const randEncr = Encryption.encrypt([Field(100)], executorAddress);
        const randSig = Signature.create(oraclePrivateKey, randEncr.cipherText);
        [incomingDelta, randomNumber] = executor.flipCoin(
          player1PrivateKey.toPublicKey(),
          merkleMap.get(key),
          witness,
          channelBalance.deltaBalance,
          channelBalance.nonce,
          channelBalanceSignature,
          randSig,
          randEncr.cipherText[0],
          randEncr.cipherText[1],
          randEncr.publicKey,
          executorPrivateKey
        );
        console.log(`Incoming Delta Balance: ${incomingDelta.toString()}`);
        deltaBalance = deltaBalance.add(incomingDelta);
        channelBalance.update(incomingDelta);
        expect(randomNumber.toString()).toBe('100');
        expect(incomingDelta.toString()).toBe('5');
      });

      console.log(
        `balance after 1: ${JSON.stringify(channelBalance.toString())}`
      );

      channelBalanceSignature = Signature.create(executorPrivateKey, [
        Poseidon.hash(channelBalance.player.toFields()),
        deltaBalance.toField(),
        Field(1),
      ]);

      Circuit.runAndCheck(() => {
        const randEncr = Encryption.encrypt([Field(987999)], executorAddress);
        const randSig = Signature.create(oraclePrivateKey, randEncr.cipherText);
        [incomingDelta, randomNumber] = executor.flipCoin(
          player1PrivateKey.toPublicKey(),
          merkleMap.get(key),
          witness,
          channelBalance.deltaBalance,
          channelBalance.nonce,
          channelBalanceSignature,
          randSig,
          randEncr.cipherText[0],
          randEncr.cipherText[1],
          randEncr.publicKey,
          executorPrivateKey
        );
        console.log(`Incoming Delta Balance: ${incomingDelta.toString()}`);
        deltaBalance = deltaBalance.add(incomingDelta);
        channelBalance.update(incomingDelta);
        expect(randomNumber.toString()).toBe('987999');
        expect(incomingDelta.toString()).toBe('-5');
      });

      channelBalanceSignature = Signature.create(executorPrivateKey, [
        Poseidon.hash(channelBalance.player.toFields()),
        deltaBalance.toField(),
        Field(2),
      ]);

      Circuit.runAndCheck(() => {
        const randEncr = Encryption.encrypt([Field(2)], executorAddress);
        const randSig = Signature.create(oraclePrivateKey, randEncr.cipherText);
        [incomingDelta, randomNumber] = executor.flipCoin(
          player1PrivateKey.toPublicKey(),
          merkleMap.get(key),
          witness,
          channelBalance.deltaBalance,
          channelBalance.nonce,
          channelBalanceSignature,
          randSig,
          randEncr.cipherText[0],
          randEncr.cipherText[1],
          randEncr.publicKey,
          executorPrivateKey
        );
        console.log(`Incoming Delta Balance: ${incomingDelta.toString()}`);
        deltaBalance = deltaBalance.add(incomingDelta);
        channelBalance.update(incomingDelta);

        channelBalanceSignature = Signature.create(executorPrivateKey, [
          Poseidon.hash(channelBalance.player.toFields()),
          deltaBalance.toField(),
          Field(3),
        ]);

        const randEncr2 = Encryption.encrypt([Field(2)], executorAddress);
        const randSig2 = Signature.create(
          oraclePrivateKey,
          randEncr2.cipherText
        );
        [incomingDelta, randomNumber] = executor.flipCoin(
          player1PrivateKey.toPublicKey(),
          merkleMap.get(key),
          witness,
          channelBalance.deltaBalance,
          channelBalance.nonce,
          channelBalanceSignature,
          randSig2,
          randEncr2.cipherText[0],
          randEncr2.cipherText[1],
          randEncr2.publicKey,
          executorPrivateKey
        );
        console.log(`Incoming Delta Balance: ${incomingDelta.toString()}`);
        deltaBalance = deltaBalance.add(incomingDelta);
        channelBalance.update(incomingDelta);
      });

      console.log(channelBalance.deltaBalance);
      const tx3 = await Mina.transaction(player1PrivateKey, () => {
        executor.removeCollateral(
          player1PrivateKey.toPublicKey(),
          Field(1000),
          witness,
          channelBalance.deltaBalance,
          channelBalance.nonce,
          Signature.create(executorPrivateKey, [
            Poseidon.hash(player1PrivateKey.toPublicKey().toFields()),
            channelBalance.deltaBalance.toField(),
            channelBalance.nonce,
          ])
        );
      });
      await tx3.prove();
      tx3.sign([player1PrivateKey]);
      await tx3.send();

      Circuit.runAndCheck(() => {
        const randEncr = Encryption.encrypt([Field(1)], executorAddress);
        const randSig = Signature.create(oraclePrivateKey, randEncr.cipherText);
        channelBalance.deltaBalance = channelBalance.deltaBalance.add(100); // try to cheat

        // should fail
        expect(() => {
          executor.flipCoin(
            player1PrivateKey.toPublicKey(),
            merkleMap.get(key),
            witness,
            channelBalance.deltaBalance,
            channelBalance.nonce,
            channelBalanceSignature,
            randSig,
            randEncr.cipherText[0],
            randEncr.cipherText[1],
            randEncr.publicKey,
            executorPrivateKey
          );
        }).toThrow();
      });
    });
  });
});
