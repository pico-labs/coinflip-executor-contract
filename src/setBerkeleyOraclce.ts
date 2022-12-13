import { isReady, Mina, PrivateKey, PublicKey, shutdown } from 'snarkyjs';
import { Executor } from './executor.js';

await isReady;

let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Berkeley);

console.log('compiling...');
await Executor.compile();
console.log('compiled!');

const oracleStr = 'B62qpvpwLbLDTLQvA2EVBrX5QXmTQ7yy9442KhCj8R1zAk21LuVKtwd';
const oracle = PublicKey.fromBase58(oracleStr);

const executorPrivateKey = PrivateKey.fromBase58('');

const executor = new Executor(executorPrivateKey.toPublicKey());
const tx = await Mina.transaction(
  { feePayerKey: executorPrivateKey, fee: 100_000_000 },
  () => {
    executor.updateRandomnessOracle(executorPrivateKey, oracle);
  }
);
await tx.prove();
await tx.sign([executorPrivateKey]);
console.log('signed update, sending...');
await tx.send();
console.log('sent!');
shutdown();
