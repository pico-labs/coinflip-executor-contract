var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PublicKey, SmartContract, Field, State, state, method, AccountUpdate, Poseidon, UInt64, MerkleMapWitness, MerkleMap, Permissions, Signature, Int64, Circuit, Bool, Encryption, PrivateKey, Group, } from 'snarkyjs';
import { ChannelBalanceProof } from './channelBalanceProof.js';
export class Executor extends SmartContract {
    constructor() {
        super(...arguments);
        this.merkleMapRoot = State();
        this.oraclePublicKey = State();
    }
    deploy(args) {
        super.deploy(args);
        this.setPermissions({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
        });
    }
    init() {
        super.init();
        this.merkleMapRoot.set(new MerkleMap().getRoot());
        this.oraclePublicKey.set(PublicKey.empty());
    }
    updateRandomnessOracle(executorPrivateKey, newOracle) {
        const thisAddress = executorPrivateKey.toPublicKey();
        thisAddress.assertEquals(this.address);
        this.oraclePublicKey.set(newOracle);
    }
    /*
     Player deposits funds
     Player must submit a merkle proof of balance
     New balance will be previous balance + new deposit
    */
    deposit(player, amount, previousBalance, witness) {
        this.proveState(player, previousBalance, witness);
        const depositUpdate = AccountUpdate.create(player);
        depositUpdate.send({ to: this.address, amount: new UInt64(amount) });
        let witnessRoot;
        witnessRoot = witness.computeRootAndKey(previousBalance.add(amount))[0];
        this.merkleMapRoot.set(witnessRoot);
    }
    /*
     Player withdraws funds
     Player must submit merkle proof of balance
     Entire balance will be withdrawn
    */
    withdraw(player, balance, witness) {
        this.proveState(player, balance, witness);
        this.send({ to: player, amount: new UInt64(balance) });
        let witnessRoot;
        witnessRoot = witness.computeRootAndKey(Field(0))[0];
        this.merkleMapRoot.set(witnessRoot);
    }
    /*
     Player flips coin
     Smart contract verifies randomness from Oracle
    */
    // TODO: add randomness element(s)
    flipCoin(player, stateBalance, witness, channelDeltaBalance, channelNonce, channelBalanceSignature, randomnessSignature, encryptionCT1, encryptionCT2, encryptionGroup, executorPrivateKey) {
        this.proveState(player, stateBalance, witness);
        const oraclePublicKey = this.oraclePublicKey.get();
        this.oraclePublicKey.assertEquals(oraclePublicKey);
        let channelBalanceProof = new ChannelBalanceProof(player, this.address);
        channelBalanceProof.deltaBalance = channelDeltaBalance;
        channelBalanceProof.nonce = channelNonce;
        channelBalanceProof.player.assertEquals(player);
        channelBalanceProof.verify(channelBalanceSignature).assertTrue();
        // console.log(`In the method - before: ${channelBalanceProof.toString()}`);
        let trueBalance = channelBalanceProof.deltaBalance.add(Int64.fromField(stateBalance));
        randomnessSignature.verify(oraclePublicKey, [encryptionCT1, encryptionCT2]).assertTrue();
        const oracleRandomness = Encryption.decrypt({
            publicKey: encryptionGroup,
            cipherText: [encryptionCT1, encryptionCT2]
        }, executorPrivateKey);
        const isValidFlip = Circuit.if(UInt64.fromFields(oracleRandomness).divMod(2).rest.equals(UInt64.zero), (() => trueBalance.toField().gt(25))(), (() => Bool(false))());
        isValidFlip.assertTrue('Balance is too low');
        const flipOutcome = Circuit.if(Bool(false), (() => Int64.fromField(Field(5)))(), (() => Int64.fromField(Field(5)).neg())());
        return flipOutcome;
    }
    proveState(player, balance, witness) {
        const stateMapRoot = this.merkleMapRoot.get();
        this.merkleMapRoot.assertEquals(stateMapRoot);
        let witnessRoot;
        let witnessKey;
        [witnessRoot, witnessKey] = witness.computeRootAndKey(balance);
        const playerKey = Poseidon.hash(player.toFields());
        this.merkleMapRoot.assertEquals(witnessRoot);
        playerKey.assertEquals(witnessKey);
    }
}
__decorate([
    state(Field),
    __metadata("design:type", Object)
], Executor.prototype, "merkleMapRoot", void 0);
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], Executor.prototype, "oraclePublicKey", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PrivateKey,
        PublicKey]),
    __metadata("design:returntype", void 0)
], Executor.prototype, "updateRandomnessOracle", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey,
        Field,
        Field,
        MerkleMapWitness]),
    __metadata("design:returntype", void 0)
], Executor.prototype, "deposit", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey, Field, MerkleMapWitness]),
    __metadata("design:returntype", void 0)
], Executor.prototype, "withdraw", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey,
        Field,
        MerkleMapWitness,
        Int64,
        Field,
        Signature,
        Signature,
        Field,
        Field,
        Group,
        PrivateKey]),
    __metadata("design:returntype", Int64)
], Executor.prototype, "flipCoin", null);
//# sourceMappingURL=Executor.js.map