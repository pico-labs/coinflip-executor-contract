import { Bool, Field, Int64, Poseidon, PublicKey, Signature } from 'snarkyjs';

export class ChannelBalanceProof {
  player: PublicKey;
  executor: PublicKey;
  deltaBalance: Int64;
  nonce: Field;

  constructor(player: PublicKey, executor: PublicKey) {
    this.player = player;
    this.executor = executor;
    this.nonce = Field(0);
    this.deltaBalance = Int64.fromField(Field(0));
  }

  update(incomingDelta: Int64) {
    this.deltaBalance = this.deltaBalance.add(incomingDelta);
    this.nonce = this.nonce.add(1);
  }

  verify(sig: Signature): Bool {
    return sig.verify(this.executor, [
      Poseidon.hash(this.player.toFields()),
      this.deltaBalance.toField(),
      this.nonce,
    ]);
  }

  toString(): string {
    return `{
      player: ${this.player.toBase58()},
      excecutor: ${this.executor.toBase58()},
      deltaBalance: ${this.deltaBalance.toString()},
      nonce: ${this.nonce.toString()}
    }`;
  }
}
