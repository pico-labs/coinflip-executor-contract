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
  Signature
} from 'snarkyjs';

import ChannelBalanceProof from './channelBalanceProof';

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
    const stateMapRoot = this.merkleMapRoot.get();
    this.merkleMapRoot.assertEquals(stateMapRoot);

    let witnessRoot: Field;
    let witnessKey: Field;
    [witnessRoot, witnessKey] = witness.computeRootAndKey(previousBalance);

    const playerKey = Poseidon.hash(player.toFields());

    // Assert that the merkle map we are pulling out of our hat is valid
    this.merkleMapRoot.assertEquals(witnessRoot);
    playerKey.assertEquals(witnessKey);

    const depositUpdate = AccountUpdate.create(player);
    depositUpdate.send({ to: this.address, amount: new UInt64(amount) });

    [witnessRoot, witnessKey] = witness.computeRootAndKey(
      previousBalance.add(amount)
    );
    this.merkleMapRoot.set(witnessRoot);
  }

  /*
   Player withdraws funds
   Player must submit merkle proof of balance
   Entire balance will be withdrawn
  */
  @method
  withdraw(player: PublicKey, balance: Field, witness: MerkleMapWitness) {
    const stateMapRoot = this.merkleMapRoot.get();
    this.merkleMapRoot.assertEquals(stateMapRoot);

    let witnessRoot: Field;
    let witnessKey: Field;
    [witnessRoot, witnessKey] = witness.computeRootAndKey(balance);

    const playerKey = Poseidon.hash(player.toFields());

    // Assert that the merkle map we are pulling out of our hat is valid
    this.merkleMapRoot.assertEquals(witnessRoot);
    playerKey.assertEquals(witnessKey);

    this.send({ to: player, amount: new UInt64(balance) });

    [witnessRoot, witnessKey] = witness.computeRootAndKey(Field(0));
    this.merkleMapRoot.set(witnessRoot);
  }

  /*
   Player flips coin
   Smart contract verifies randomness from Oracle
  */
  @method
  flipCoin(
    player: PublicKey,
    stateBalance: Field,
    witness: MerkleMapWitness,
    channelBalanceProof: ChannelBalanceProof,
    playerChosenRandomness: Field,
    oracleRandomness: Signature
  ) {
    const stateMapRoot = this.merkleMapRoot.get();
    this.merkleMapRoot.assertEquals(stateMapRoot);

    let witnessRoot: Field;
    let witnessKey: Field;
    [witnessRoot, witnessKey] = witness.computeRootAndKey(stateBalance);

    const playerKey = Poseidon.hash(player.toFields());
  }
}
