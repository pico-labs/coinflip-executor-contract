import { isReady, shutdown, Mina, PrivateKey, PublicKey } from 'snarkyjs';

import { Executor } from './executor.js';

await isReady;

let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Berkeley);

console.log('compiling...');
await Executor.compile();
console.log('compiled!');

const executorPublicKey = PublicKey.fromBase58(
  'B62qjAwNeTb4YqpaNwrLmCporHJ2jRiq5xYuVdGpmwq94cke2FQtVQG'
);

const executorPrivateKey = PrivateKey.fromBase58(
  'EKFBSYJGusUkRX9gpu8mJMkfYQjHg9oVvDfVL5ottQnvx8j55AfU'
);

// // Redeploy contract
const executor = new Executor(executorPublicKey);
const tx = await Mina.transaction(
  { feePayerKey: executorPrivateKey, fee: 100_000_000 },
  () => {
    //   executor.deploy(({ zkappKey: executorPrivateKey }));
    executor.init();
  }
);
tx.sign([executorPrivateKey]);
console.log('signed deploy/init, sending...');
tx.send();
console.log('sent!');

// Any valid, funded private key will do, no one has successfully deposited yet, so the existing state is an empty merkle map
//   const player1PrivateKey = PrivateKey.fromBase58('EKFaBgepGLeEnyJMxCMQeMVyNNoTLowQqtnJdKVWK2V4ySfYbxjT');

//   const merkleMap = new MerkleMap();
//   const key = Poseidon.hash(player1PrivateKey.toPublicKey().toFields());
//   const witness = merkleMap.getWitness(key);

//   const tx2 = await Mina.transaction(
//     { feePayerKey: player1PrivateKey, fee: 100_000_000 },
//     () => {
//       executor.deposit(
//         player1PrivateKey.toPublicKey(),
//         Field(1000),
//         Field(0),
//         witness
//       );
//     }
//   );
//   console.log('Proving tx...');
//   await tx2.prove();
//   tx2.sign([player1PrivateKey]);
//   console.log('Sending tx...');

//   await tx2.send();

shutdown();
