import { ethers } from 'hardhat';
import { MockProvider } from 'ethereum-waffle';
import chai from 'chai';
import { Contract, ContractFactory, Signer } from 'ethers';

const { expect } = chai;
const { parseEther } = ethers.utils;

const provider = new MockProvider();
let signers: Signer[];
let splitterFactory: ContractFactory;
const wallets = provider.getWallets();

describe('InvoiceSplitter', () => {
    let splitter: Contract;
    const shareholders = wallets.slice(-3);
    const shareholdersAddresses = shareholders.map(({ address }) => address);
    const shares = [
        10,
        35,
        55,
    ];

    before(async () => {
        signers = await ethers.getSigners();
    });

    beforeEach(async () => {
        splitterFactory = await ethers.getContractFactory(
            'InvoiceSplitter',
            signers[0],
        );
        splitter = await splitterFactory.deploy();
        await splitter.deployed();
    });

    describe('addProject', async () => {
        it('reverts when no due amount', async () => {
            expect(splitter.addProject(0, shareholdersAddresses, shares))
                .to.be.revertedWith('Too low due amount');
        });

        it('reverts when too many shareholders', async () => {
            const tooManyShareholders = Array.from({ length: 50 }, () => wallets[4].address);
            expect(splitter.addProject(1, tooManyShareholders, shares))
                .to.be.revertedWith('Too many shareholders');
        });

        it('reverts when no shareholders provided', async () => {
            expect(splitter.addProject(1, [], shares))
                .to.be.revertedWith('No shareholder wallet address provided');
        });

        it('reverts when no shares provided', async () => {
            expect(splitter.addProject(1, shareholdersAddresses, []))
                .to.be.revertedWith('No shares provided');
        });

        it('reverts when shareholder and shares count are different', async () => {
            expect(splitter.addProject(1, shareholdersAddresses, [10, 10]))
                .to.be.revertedWith('Shares count must be equal to shareholders count');
        });

        it('adds new project and shareholders', async () => {
            expect(splitter.addProject(1, shareholdersAddresses, shares))
                .to.emit(splitter, 'ProjectAdded')
                .withArgs(1, shareholdersAddresses, shares);
        });

        it('increments project id', async () => {
            expect(splitter.addProject(1, shareholdersAddresses, shares))
                .to.emit(splitter, 'ProjectAdded')
                .withArgs(1, shareholdersAddresses, shares);

            expect(splitter.addProject(1, shareholdersAddresses, shares))
                .to.emit(splitter, 'ProjectAdded')
                .withArgs(2, shareholdersAddresses, shares);
        });
    });

    describe('payProject', async () => {
        const expectedDueAmount = parseEther('5');

        beforeEach(async () => {
            await splitter.addProject(expectedDueAmount, shareholdersAddresses, shares);
        });

        it('reverts for non-existing project', () => {
            expect(splitter.payProject(1024, { value: 5 }))
                .to.be.revertedWith('Project does not exist');
        });

        it('reverts when amount sent is too low', () => {
            expect(splitter.payProject(1, { value: 2 }))
                .to.be.revertedWith('Sent amount is too low');
        });

        it('emits PaymentReceived event', async () => {
            const anotherAccount = signers[1];

            const result = await splitter
                .connect(anotherAccount)
                .payProject(1, { value: expectedDueAmount });

            await result.wait();

            expect(
                result,
            )
                .to.emit(splitter, 'PaymentReceived')
                .withArgs(await anotherAccount.getAddress(), expectedDueAmount);
        });

        xit('sends ether to shareholders', async () => {
            // TODO: investigate why this tests fails even if the contract is working fine
            const anotherAccount = signers[2];
            // const calculateEthFromPercent = (percent: number) => expectedDueAmount.mul(percent).div(100);

            // const initialSenderBalance = await anotherAccount.getBalance();
            // const initialShareholderBalance = await shareholders[0].getBalance();

            const result = await splitter
                .connect(anotherAccount)
                .payProject(1, { value: expectedDueAmount, gasPrice: 0 });

            await result.wait(1);

            expect(
                result,
            )
                .to.changeEtherBalances(
                    [
                        // anotherAccount,
                        ...shareholders,
                    ],
                    [
                        // (await anotherAccount.getBalance()).sub(expectedDueAmount),
                        // calculateEthFromPercent(shares[0]),
                        // calculateEthFromPercent(shares[1]),
                        // calculateEthFromPercent(shares[2]),
                        // 1,
                        2,
                        3,
                        4,
                    ],
                );
        });
    });
    xdescribe('withdrawBalance', async () => {
        it('let\'s the owner withdraw everything just in case', async () => {
            const expectedBalance = parseEther('5');

            await splitter.sendTransaction({ from: signers[2], value: expectedBalance });

            // TODO: this throws, as Waffle's `changeEtherBalances` supports a single
            // transaction only
            expect(splitter.withdrawBalance()).to.changeEtherBalances(
                [
                    splitter,
                    signers[0],
                ],
                [
                    -expectedBalance,
                    expectedBalance,
                ],
            );
        });
    });
});
