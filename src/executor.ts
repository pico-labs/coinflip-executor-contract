import {
  PublicKey,
  SmartContract,
  Field,
  State,
  state,
  DeployArgs,
  method,
  AccountUpdate,
  Poseidon,
  UInt64,
  MerkleMapWitness,
  MerkleMap,
  Permissions,
  Signature,
  Int64,
  Circuit,
  Bool,
} from 'snarkyjs';

import { ChannelBalanceProof } from './channelBalanceProof.js';

export class Executor extends SmartContract {
  @state(Field) merkleMapRoot = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proof(),
      send: Permissions.proof(),
    });
  }

  init() {
    super.init();

    this.merkleMapRoot.set(new MerkleMap().getRoot());
  }

  /*
   Player deposits funds
   Player must submit a merkle proof of balance
   New balance will be previous balance + new deposit
  */
  @method
  deposit(
    player: PublicKey,
    amount: Field,
    previousBalance: Field,
    witness: MerkleMapWitness
  ) {
    this.proveState(player, previousBalance, witness);

    const depositUpdate = AccountUpdate.create(player);
    depositUpdate.send({ to: this.address, amount: new UInt64(amount) });

    let witnessRoot: Field;
    witnessRoot = witness.computeRootAndKey(previousBalance.add(amount))[0];
    this.merkleMapRoot.set(witnessRoot);
  }

  /*
   Player withdraws funds
   Player must submit merkle proof of balance
   Entire balance will be withdrawn
  */
  @method
  withdraw(player: PublicKey, balance: Field, witness: MerkleMapWitness) {
    this.proveState(player, balance, witness);

    this.send({ to: player, amount: new UInt64(balance) });

    let witnessRoot: Field;
    witnessRoot = witness.computeRootAndKey(Field(0))[0];
    this.merkleMapRoot.set(witnessRoot);
  }

  /*
   Player flips coin
   Smart contract verifies randomness from Oracle
  */

  // TODO: add randomness element(s)
  @method
  flipCoin(
    player: PublicKey,
    stateBalance: Field,
    witness: MerkleMapWitness,
    channelDeltaBalance: Int64,
    channelNonce: Field,
    channelBalanceSignature: Signature
  ): Int64 {
    this.proveState(player, stateBalance, witness);
    let channelBalanceProof = new ChannelBalanceProof(player, this.address);
    channelBalanceProof.deltaBalance = channelDeltaBalance;
    channelBalanceProof.nonce = channelNonce;
    channelBalanceProof.player.assertEquals(player);
    channelBalanceProof.verify(channelBalanceSignature).assertTrue();

    // console.log(`In the method - before: ${channelBalanceProof.toString()}`);

    let trueBalance = channelBalanceProof.deltaBalance.add(
      Int64.fromField(stateBalance)
    );

    // TODO: just using 100 as a random value for now, clean this up
    const isValidFlip = Circuit.if(
      trueBalance.isPositive(),
      (() => trueBalance.toField().gt(100))(),
      (() => Bool(false))()
    );
    isValidFlip.assertTrue();

    const flipOutcome = Circuit.if(
      Bool(false),
      (() => Int64.fromField(Field(5)))(),
      (() => Int64.fromField(Field(5)).neg())()
    );

    return flipOutcome;
  }

  proveState(player: PublicKey, balance: Field, witness: MerkleMapWitness) {
    const stateMapRoot = this.merkleMapRoot.get();
    this.merkleMapRoot.assertEquals(stateMapRoot);

    let witnessRoot: Field;
    let witnessKey: Field;
    [witnessRoot, witnessKey] = witness.computeRootAndKey(balance);

    const playerKey = Poseidon.hash(player.toFields());

    this.merkleMapRoot.assertEquals(witnessRoot);
    playerKey.assertEquals(witnessKey);
  }
}
