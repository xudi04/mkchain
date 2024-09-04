const {BlockChain, Transaction} = require("./Blockchain");
const EC = require("elliptic").ec;
var ec = new EC("secp256k1");
// 1f5fc5b43934e9400e3edfeca76bccf9d31ad700c29eef38b0d99bb4272223e5

var mykey = ec.keyFromPrivate("1f5fc5b43934e9400e3edfeca76bccf9d31ad700c29eef38b0d99bb4272223e5");
var myWalletAddress = mykey.getPublic("hex");

let savjeeCoin = new BlockChain();

var tx1 = new Transaction(myWalletAddress, "ok", 10);
tx1.signTransaction(mykey);
savjeeCoin.addTransaction(tx1);

console.log("\n Starting the miner...");
savjeeCoin.minePendingTransactions(myWalletAddress);

console.log("\n Balance of Mustafa is ", savjeeCoin.getBalanceOfAddress(myWalletAddress));

console.log("chain is valid ? => " + savjeeCoin.isChainValid());


