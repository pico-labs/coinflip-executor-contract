import { PublicKey, SmartContract, Field, State, DeployArgs, MerkleMapWitness } from 'snarkyjs';
export declare class Executor extends SmartContract {
    merkleMapRoot: State<Field>;
    deploy(args: DeployArgs): void;
    init(): void;
    deposit(player: PublicKey, amount: Field, previousBalance: Field, witness: MerkleMapWitness): void;
    withdraw(player: PublicKey, balance: Field, witness: MerkleMapWitness): void;
}
