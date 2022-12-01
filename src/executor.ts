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
} from 'snarkyjs';

export class Executor extends SmartContract {
  @state(Field) merkleMapRoot = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    // todo...
  }

  init() {
    super.init();

    this.merkleMapRoot.set(new MerkleMap().getRoot());
  }

  /*
   Player deposits funds, receieves an IOU from the executor
   IOU shape is [{balance}, {nonce}]?
    (need some way to nullify any previous IOU and only count the most recent)
   This method should increment the contract balance and decrement the player balance
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
}
