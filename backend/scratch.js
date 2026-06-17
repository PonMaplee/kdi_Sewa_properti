const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
const abi = ["function owner() view returns (address)"];
const contract = new ethers.Contract("0x70E426B6b1FFFF5450e5e9F2D1c1E6678D5e0500", abi, provider);
contract.owner().then(console.log).catch(console.error);
