import { Field, Int64, Poseidon } from 'snarkyjs';
export class ChannelBalanceProof {
    constructor(player, executor) {
        this.player = player;
        this.executor = executor;
        this.nonce = Field(0);
        this.deltaBalance = Int64.fromField(Field(0));
    }
    update(incomingDelta) {
        this.deltaBalance = this.deltaBalance.add(incomingDelta);
        this.nonce = this.nonce.add(1);
    }
    verify(sig) {
        return sig.verify(this.executor, [
            Poseidon.hash(this.player.toFields()),
            this.deltaBalance.toField(),
            this.nonce,
        ]);
    }
    toString() {
        return `{
      player: ${this.player.toBase58()},
      excecutor: ${this.executor.toBase58()},
      deltaBalance: ${this.deltaBalance.toString()},
      nonce: ${this.nonce.toString()}
    }`;
    }
}
//# sourceMappingURL=channelBalanceProof.js.map