import { ethers } from 'hardhat';

(async function main() {
    const InvoiceSplitter = await ethers.getContractFactory('InvoiceSplitter');
    const instance = await InvoiceSplitter.deploy();

    console.log('Contract address', instance.address);
}());
