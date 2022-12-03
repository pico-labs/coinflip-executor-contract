var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PublicKey, SmartContract, Field, State, state, method, AccountUpdate, Poseidon, UInt64, MerkleMapWitness, MerkleMap, Permissions, } from 'snarkyjs';
export class Executor extends SmartContract {
    constructor() {
        super(...arguments);
        this.merkleMapRoot = State();
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
    }
    /*
     Player deposits funds
     Player must submit a merkle proof of balance
     New balance will be previous balance + new deposit
    */
    deposit(player, amount, previousBalance, witness) {
        const stateMapRoot = this.merkleMapRoot.get();
        this.merkleMapRoot.assertEquals(stateMapRoot);
        let witnessRoot;
        let witnessKey;
        [witnessRoot, witnessKey] = witness.computeRootAndKey(previousBalance);
        const playerKey = Poseidon.hash(player.toFields());
        // Assert that the merkle map we are pulling out of our hat is valid
        this.merkleMapRoot.assertEquals(witnessRoot);
        playerKey.assertEquals(witnessKey);
        const depositUpdate = AccountUpdate.create(player);
        depositUpdate.send({ to: this.address, amount: new UInt64(amount) });
        [witnessRoot, witnessKey] = witness.computeRootAndKey(previousBalance.add(amount));
        this.merkleMapRoot.set(witnessRoot);
    }
    /*
     Player withdraws funds
     Player must submit merkle proof of balance
     Entire balance will be withdrawn
    */
    withdraw(player, balance, witness) {
        const stateMapRoot = this.merkleMapRoot.get();
        this.merkleMapRoot.assertEquals(stateMapRoot);
        let witnessRoot;
        let witnessKey;
        [witnessRoot, witnessKey] = witness.computeRootAndKey(balance);
        const playerKey = Poseidon.hash(player.toFields());
        // Assert that the merkle map we are pulling out of our hat is valid
        this.merkleMapRoot.assertEquals(witnessRoot);
        playerKey.assertEquals(witnessKey);
        this.send({ to: player, amount: new UInt64(balance) });
        [witnessRoot, witnessKey] = witness.computeRootAndKey(Field(0));
        this.merkleMapRoot.set(witnessRoot);
    }
}
__decorate([
    state(Field),
    __metadata("design:type", Object)
], Executor.prototype, "merkleMapRoot", void 0);
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
//# sourceMappingURL=executor.js.map