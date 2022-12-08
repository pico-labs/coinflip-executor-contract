import {
  isReady,
  shutdown,
  Mina,
  PrivateKey,
  PublicKey,
  MerkleMap,
  Field,
  Poseidon,
} from 'snarkyjs';

import { Executor } from './executor.js';

await isReady;
console.log('compiling...');
await Executor.compile();
console.log('compiled!');

const executorPublicKey = PublicKey.fromBase58(
  'B62qjb2oGVMGiPad6GKTBh6MqgFJ3ExhkfegBuUiynLoyCSbTfM62vW'
);

// Any valid, funded private key will do, no one has successfully deposited yet, so the existing state is an empty merkle map
const player1PrivateKey = PrivateKey.fromBase58('');

let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Berkeley);

const merkleMap = new MerkleMap();
const key = Poseidon.hash(player1PrivateKey.toPublicKey().toFields());
const witness = merkleMap.getWitness(key);
const executor = new Executor(executorPublicKey);

const tx = await Mina.transaction(
  { feePayerKey: player1PrivateKey, fee: 100_000_000 },
  () => {
    executor.deposit(
      player1PrivateKey.toPublicKey(),
      Field(1000),
      Field(0),
      witness
    );
  }
);
console.log('Proving tx...');
await tx.prove();
tx.sign([player1PrivateKey]);
console.log('Sending tx...');

await tx.send();

shutdown();
