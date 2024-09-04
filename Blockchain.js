const SHA256 = require('crypto-js/sha256');
const EC = require("elliptic").ec
var ec = new EC("secp256k1");

class Transaction {
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress  = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if (signingKey.getPublic("hex") != this.fromAddress) {
            throw new Error("you cannot sign transaction for other wallet!");
            
        }

        const hashTx = this.calculateHash();
        const sign = signingKey.sign(hashTx, "base64");
        this.signature = sign.toDER("hex");
    }

    isValid(){
        if(this.fromAddress == null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error("No Signature in this Transaction");
        }

        const publickKey = ec.keyFromPublic(this.fromAddress, "hex");
        return publickKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(/*index*/ timestamp, /*data => */ transations, previousHash =''){
        // this.index = index;
        this.timestamp = timestamp;
        // this.data = data;
        this.transations = transations;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.timestamp + this.previousHash + JSON.stringify(this.data) + this.nonce).toString();
    } // data is object - installed crypto-js 

    minBlock(difficulty){
        while (this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
 
        console.log("Block Mined : " + this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transations){
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}


class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReword = 100;
    }

    createGenesisBlock(){
        return new Block(/*0*/"08/07/2024", "Genesis Block", "0");
    }

    getLatesBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatesBlock().hash;
        newBlock.minBlock(this.difficulty);
        this.chain.push(newBlock);
    } // artik yok

    minePendingTransactions(mineRewardAddress){
        var block = new Block(Date.now(), this.pendingTransactions);
        block.minBlock(this.difficulty);

        console.log("Block Successfully mined!");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, mineRewardAddress, this.miningReword)
        ];
        
    }

    addTransaction(transations){

        if (!transations.fromAddress || !transations.toAddress) {
            throw new Error("Transaction must include from and to address");
        }

        if(!transations.isValid()){
            throw new Error("Cannot add invalid Transaction to chain");
        }

        this.pendingTransactions.push(transations);
    }

    getBalanceOfAddress(address){
        var balance = 100;

        for(const block of this.chain){
            for(const trans of block.transations){
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(){
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}


module.exports.BlockChain = BlockChain;
module.exports.Transaction =  Transaction;