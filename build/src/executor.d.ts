import { PublicKey, SmartContract, Field, State, DeployArgs, MerkleMapWitness, Signature, Int64 } from 'snarkyjs';
export declare class Executor extends SmartContract {
    merkleMapRoot: State<Field>;
    deploy(args: DeployArgs): void;
    init(): void;
    deposit(player: PublicKey, amount: Field, previousBalance: Field, witness: MerkleMapWitness): void;
    withdraw(player: PublicKey, balance: Field, witness: MerkleMapWitness): void;
    flipCoin(player: PublicKey, stateBalance: Field, witness: MerkleMapWitness, channelDeltaBalance: Int64, channelNonce: Field, channelBalanceSignature: Signature): Int64;
    proveState(player: PublicKey, balance: Field, witness: MerkleMapWitness): void;
}
