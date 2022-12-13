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
  Encryption,
  PrivateKey,
  Group,
} from 'snarkyjs';

import { ChannelBalanceProof } from './channelBalanceProof.js';

export class Executor extends SmartContract {
  @state(Field) merkleMapRoot = State<Field>();
  @state(PublicKey) oraclePublicKey = State<PublicKey>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proof(),
      send: Permissions.proofOrSignature(),
    });
  }

  init() {
    super.init();

    this.merkleMapRoot.set(new MerkleMap().getRoot());
    this.oraclePublicKey.set(PublicKey.empty());
  }

  @method
  updateRandomnessOracle(executorPrivateKey: PrivateKey, newOracle: PublicKey) {
    const thisAddress = executorPrivateKey.toPublicKey();
    thisAddress.assertEquals(this.address);

    this.oraclePublicKey.set(newOracle);
  }

  /*
   Player adds collateral
   Player must submit a merkle proof of existing collateral
   Collateral will become previous collateral + new collateral
  */
  @method
  addCollateral(
    player: PublicKey,
    amount: Field,
    previousCollateral: Field,
    witness: MerkleMapWitness
  ) {
    this.proveState(player, previousCollateral, witness);

    const depositUpdate = AccountUpdate.create(player);
    depositUpdate.send({ to: this.address, amount: new UInt64(amount) });
    depositUpdate.requireSignature();

    let witnessRoot: Field;
    witnessRoot = witness.computeRootAndKey(previousCollateral.add(amount))[0];
    this.merkleMapRoot.set(witnessRoot);
  }

  /*
   Player removes collateral
   Player must submit a merkle proof of existing collateral
   Player must sumbit a signed message from the executor with delta (winnings or losings) from flips
   Entire collateral will be removed, adjusted by the delta
  */
  @method
  removeCollateral(
    player: PublicKey,
    collateral: Field,
    witness: MerkleMapWitness,
    channelDeltaBalance: Int64,
    channelNonce: Field,
    channelBalanceSignature: Signature
  ) {
    this.proveState(player, collateral, witness);

    let channelBalanceProof = new ChannelBalanceProof(player, this.address);
    channelBalanceProof.deltaBalance = channelDeltaBalance;
    channelBalanceProof.nonce = channelNonce;
    channelBalanceProof.player.assertEquals(player);
    channelBalanceProof.verify(channelBalanceSignature).assertTrue();

    const withdrawAmount = channelBalanceProof.deltaBalance.add(
      UInt64.from(collateral)
    );
    withdrawAmount.isPositive().assertTrue();
    this.send({ to: player, amount: withdrawAmount.magnitude });

    let witnessRoot: Field;
    witnessRoot = witness.computeRootAndKey(Field(0))[0];
    this.merkleMapRoot.set(witnessRoot);
  }

  /*
   Player flips coin
   Executor verifies the current payment channel balance
   Executor verifies the randomness from oracle
   Executor decrypts the randomness from oracle
   Executor credits or debits the player in the payment channel
   @returns [the credit or debit amoutnt: Int64, the random number, recovered from the oracle: Field]
  */
  @method
  flipCoin(
    player: PublicKey,
    stateBalance: Field,
    witness: MerkleMapWitness,
    channelDeltaBalance: Int64,
    channelNonce: Field,
    channelBalanceSignature: Signature,
    randomnessSignature: Signature,
    encryptionCT1: Field,
    encryptionCT2: Field,
    encryptionGroup: Group,
    executorPrivateKey: PrivateKey
  ): [Int64, Field] {
    this.proveState(player, stateBalance, witness);
    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(oraclePublicKey);

    let channelBalanceProof = new ChannelBalanceProof(player, this.address);
    channelBalanceProof.deltaBalance = channelDeltaBalance;
    channelBalanceProof.nonce = channelNonce;
    channelBalanceProof.player.assertEquals(player);
    channelBalanceProof.verify(channelBalanceSignature).assertTrue();

    let trueBalance = channelBalanceProof.deltaBalance.add(
      Int64.fromField(stateBalance)
    );

    const isValidFlip = trueBalance.toField().gt(Field(25));
    isValidFlip.assertTrue('Balance is too low');

    randomnessSignature
      .verify(oraclePublicKey, [encryptionCT1, encryptionCT2])
      .assertTrue();

    const oracleRandomness = Encryption.decrypt(
      {
        publicKey: encryptionGroup,
        cipherText: [encryptionCT1, encryptionCT2],
      },
      executorPrivateKey
    );

    const flipOutcome = Circuit.if(
      UInt64.fromFields(oracleRandomness).divMod(2).rest.equals(UInt64.zero),
      (() => Int64.fromField(Field(5)))(),
      (() => Int64.fromField(Field(5)).neg())()
    );

    return [flipOutcome, oracleRandomness[0]];
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
