const EC = require("elliptic").ec

var ec = new EC("secp256k1");
var key = ec.genKeyPair();
var publickKey = key.getPublic("hex");
var privateKey = key.getPrivate("hex");

console.log();
console.log("genel key : " + publickKey);

console.log();
console.log("Özel Key : " + privateKey);
