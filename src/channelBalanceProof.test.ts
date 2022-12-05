import { Field, Int64, isReady, Mina, PrivateKey, shutdown } from 'snarkyjs';
import { ChannelBalanceProof } from './channelBalanceProof';
import { Signature } from 'snarkyjs';
import { Poseidon } from 'snarkyjs';

await isReady;

describe('channelBalanceProof.js', () => {
  let player: PrivateKey, executor: PrivateKey;

  beforeEach(async () => {
    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);

    player = PrivateKey.random();
    executor = PrivateKey.random();
  });

  afterAll(async () => {
    setTimeout(shutdown, 0);
  });

  it('update', () => {
    const proof = new ChannelBalanceProof(
      player.toPublicKey(),
      executor.toPublicKey()
    );

    expect(proof.deltaBalance.toString()).toBe('0');
    expect(proof.nonce.toString()).toBe('0');

    proof.update(Int64.fromField(Field(10)));

    expect(proof.deltaBalance.toString()).toBe('10');
    expect(proof.nonce.toString()).toBe('1');

    proof.update(Int64.fromField(Field(6).neg()));

    expect(proof.deltaBalance.toString()).toBe('4');
    expect(proof.nonce.toString()).toBe('2');
  });

  it('verify', () => {
    const proof = new ChannelBalanceProof(
      player.toPublicKey(),
      executor.toPublicKey()
    );
    proof.deltaBalance = Int64.fromField(Field(135).neg());
    proof.nonce = Field(10);

    const sig = Signature.create(executor, [
      Poseidon.hash(player.toPublicKey().toFields()),
      Int64.fromField(Field(135).neg()).toField(),
      Field(10),
    ]);

    expect(
      sig
        .verify(executor.toPublicKey(), [
          Poseidon.hash(player.toPublicKey().toFields()),
          Int64.fromField(Field(135).neg()).toField(),
          Field(10),
        ])
        .toBoolean()
    ).toBe(true);

    expect(
      sig
        .verify(executor.toPublicKey(), [
          Poseidon.hash(player.toPublicKey().toFields()),
          Int64.fromField(Field(135)).toField(),
          Field(10),
        ])
        .toBoolean()
    ).toBe(false);
  });
});
