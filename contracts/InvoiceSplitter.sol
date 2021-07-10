// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract InvoiceSplitter is Ownable {
    struct Shareholder {
        address walletAddress;
        uint256 shares;
        bool sharePaid;
    }
    mapping(uint256 => Shareholder[]) projectToShareholder;
    mapping(uint256 => uint256) projectToShareholderCount;
    mapping(uint256 => bool) paidProjects;

    uint256 projectCount;
    uint8 maxShareholderCount = 30;

    event PaymentReceived(address from, uint256 amount);
    event ProjectAdded(uint256 projectId, address[] shareholders, uint256[] shares);

    function addProject(
        address[] memory walletAddresses,
        uint256[] memory shares
    ) public returns(bool success) {
        // Restrict the number of shareholders
        require(
            walletAddresses.length <= maxShareholderCount,
            'Too many shareholders'
        );
        require(
            walletAddresses.length > 0,
            'No shareholder wallet address provided'
        );
        require(
            shares.length > 0,
            'No shares provided'
        );
        require(
            walletAddresses.length == shares.length,
            'Shares count must be equal to shareholders count'
        );

        uint256 addedProjectId = projectCount + 1;

        // Only execute for new projects
        require(
            projectToShareholder[addedProjectId].length == 0,
            'Project already exists'
        );

        projectCount += 1;

        projectToShareholderCount[projectCount] = walletAddresses.length;

        for (uint256 i = 0; i < walletAddresses.length; i++) {
            Shareholder memory shareholder;

            shareholder.walletAddress = walletAddresses[i];
            shareholder.shares = shares[i];
            shareholder.sharePaid = false;

            projectToShareholder[projectCount].push(shareholder);
        }

        emit ProjectAdded(projectCount, walletAddresses, shares);
        return true;
    }

}
