import { ethers } from 'hardhat';
import { MockProvider } from 'ethereum-waffle';
import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
import { Contract } from 'ethers';

// chai.use(chaiAsPromised);
const { expect } = chai;

const wallets = new MockProvider().getWallets();

describe('InvoiceSplitter', () => {
    let splitter: Contract;
    const shareholders = wallets.slice(-3).map((w) => w.address);
    const shares = [
        10,
        40,
        40,
    ];

    beforeEach(async () => {
        const signers = await ethers.getSigners();
        const splitterFactory = (await ethers.getContractFactory(
            'InvoiceSplitter',
            signers[0],
        ));
        splitter = await splitterFactory.deploy();
        await splitter.deployed();
    });

    describe('addProject', async () => {
        it('adds new project and shareholders', async () => {
            expect(await splitter.addProject(shareholders, shares))
                .to.emit(splitter, 'ProjectAdded')
                .withArgs(1, shareholders, shares);
        });
    });
});
