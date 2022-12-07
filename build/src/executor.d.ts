import { PublicKey, SmartContract, Field, State, DeployArgs, MerkleMapWitness, Signature, Int64, PrivateKey, Group } from 'snarkyjs';
export declare class Executor extends SmartContract {
    merkleMapRoot: State<Field>;
    oraclePublicKey: State<PublicKey>;
    deploy(args: DeployArgs): void;
    init(): void;
    updateRandomnessOracle(executorPrivateKey: PrivateKey, newOracle: PublicKey): void;
    deposit(player: PublicKey, amount: Field, previousBalance: Field, witness: MerkleMapWitness): void;
    withdraw(player: PublicKey, balance: Field, witness: MerkleMapWitness): void;
    flipCoin(player: PublicKey, stateBalance: Field, witness: MerkleMapWitness, channelDeltaBalance: Int64, channelNonce: Field, channelBalanceSignature: Signature, randomnessSignature: Signature, encryptionCT1: Field, encryptionCT2: Field, encryptionGroup: Group, executorPrivateKey: PrivateKey): Int64;
    proveState(player: PublicKey, balance: Field, witness: MerkleMapWitness): void;
}
