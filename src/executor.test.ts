import {
  isReady,
  shutdown,
  Mina,
  PrivateKey,
  PublicKey,
  UInt64,
  AccountUpdate,
} from 'snarkyjs';

import { Executor } from './executor';

describe('executor', () => {
  let executorPrivateKey: PrivateKey;
  let executorAddress: PublicKey;

  let deployerPrivateKey: PrivateKey;
  let player1PrivateKey: PrivateKey;
  let player2PrivateKey: PrivateKey;
  let player3PrivateKey: PrivateKey;

  beforeEach(async () => {
    await isReady;
    await Executor.compile();

    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);

    executorPrivateKey = PrivateKey.random();
    executorAddress = executorPrivateKey.toPublicKey();
  });

  afterAll(async () => {
    setTimeout(shutdown, 0);
  });

  it('deploys', async () => {
    const executor = new Executor(executorAddress);
    const tx = await Mina.transaction(deployerPrivateKey, () => {
      AccountUpdate.fundNewAccount(deployerPrivateKey);
      executor.deploy({ zkappKey: executorPrivateKey });
      executor.sign(executorPrivateKey);
    });
    await tx.send();
  });
});
