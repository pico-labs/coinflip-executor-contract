import { Bool, Field, Int64, PublicKey, Signature } from 'snarkyjs';
export declare class ChannelBalanceProof {
    player: PublicKey;
    executor: PublicKey;
    deltaBalance: Int64;
    nonce: Field;
    constructor(player: PublicKey, executor: PublicKey);
    update(incomingDelta: Int64): void;
    verify(sig: Signature): Bool;
    toString(): string;
}
