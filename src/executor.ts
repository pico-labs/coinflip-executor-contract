import {
  PublicKey,
  SmartContract,
  Field,
  State,
  state,
  DeployArgs,
  method,
  Signature,
  PrivateKey,
  AccountUpdate,
  MerkleMap,
  Poseidon,
  UInt64,
} from 'snarkyjs';

export class Executor extends SmartContract {
  @state(PublicKey) randomnessOracle = State<PublicKey>();
  @state(Field) merkleMapRoot = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    // todo...
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
    map: MerkleMap
  ): MerkleMap {
    const stateMapRoot = this.merkleMapRoot.get();
    this.merkleMapRoot.assertEquals(stateMapRoot);

    // Assert that the merkle map we are pulling out of our hat is valid
    this.merkleMapRoot.assertEquals(map.getRoot());

    const depositUpdate = AccountUpdate.create(player);
    depositUpdate.send({ to: this.address, amount: new UInt64(amount) });

    const key = Poseidon.hash(player.toFields())
    const currentValue = map.get(key);
    map.set(key, currentValue.add(Field(amount)));

    this.merkleMapRoot.set(map.getRoot());

    return map;
  }

  /*
   Player withdraws funds
   Player must submit most recent IOU as proof of balance
  */
  @method
  withdraw(
    player: PublicKey,
    iou: Signature,
    iouBalance: number,
    iouNonce: number
  ) {
    const v = iou.verify(this.address, [Field(iouBalance), Field(iouNonce)]);
    v.assertTrue();
    // perform withdrawl...
  }

  /*
   Perform coinflip
   Player submits encrypted packet from randomness oracle
   Executor decrypts and verifies the packet
   Executor updates IOU and returns to player with new balance and nonce
  */
  @method
  flipCoin(
    player: PublicKey,
    randomness: Field[],
    executorKey: PrivateKey
  ): Signature {
    // perform flip...
    // ...

    return Signature.create(executorKey, [Field(0), Field(0)]);
  }
}
