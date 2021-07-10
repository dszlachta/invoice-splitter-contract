// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract InvoiceSplitter is ReentrancyGuard, Ownable {
    struct Shareholder {
        address walletAddress;
        uint256 shares;
        bool sharePaid;
    }
    mapping(uint256 => Shareholder[]) projectToShareholders;
    mapping(uint256 => uint256) projectToShareholderCount;
    mapping(uint256 => bool) paidProjects;

    mapping(uint256 => uint256) projectToAmount;

    uint256 projectCount;
    uint8 maxShareholderCount = 30;

    event PaymentReceived(address from, uint256 amount);
    event ProjectAdded(uint256 projectId, address[] shareholders, uint256[] shares);
    event SharePaid(address wallet, uint256 projectId, uint256 amount);
    event Withdrawn(address owner, uint256 amount);

    function addProject(
        uint256 amountDue,
        address[] memory walletAddresses,
        uint256[] memory shares
    ) onlyOwner public returns(bool success) {
        require(
            amountDue > 0,
            'Too low due amount'
        );

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

        projectCount += 1;

        projectToShareholderCount[projectCount] = walletAddresses.length;
        projectToAmount[projectCount] = amountDue;

        for (uint256 i = 0; i < walletAddresses.length; i++) {
            projectToShareholders[projectCount].push(Shareholder({
                walletAddress: walletAddresses[i],
                shares: shares[i],
                sharePaid: false
            }));
        }

        emit ProjectAdded(projectCount, walletAddresses, shares);
        return true;
    }

    function payProject(uint256 projectId) nonReentrant payable external {
        require(
            projectToShareholderCount[projectId] > 0,
            'Project does not exist'
        );

        require(
            msg.value >= projectToAmount[projectId],
            'Sent amount is too low'
        );

        require(
            paidProjects[projectId] == false,
            'Project already paid'
        );

        emit PaymentReceived(msg.sender, msg.value);

        for (uint256 i = 0; i < projectToShareholders[projectId].length; i++) {
            require(
                projectToShareholders[projectId][i].sharePaid == false,
                'Share already paid to the shareholder'
            );

            projectToShareholders[projectId][i].sharePaid = true;

            uint256 shareholderPayment = msg.value * projectToShareholders[projectId][i].shares / 100;

            payable(projectToShareholders[projectId][i].walletAddress).transfer(shareholderPayment);
            emit SharePaid(projectToShareholders[projectId][i].walletAddress, projectId, shareholderPayment);
        }

        paidProjects[projectId] = true;
    }

    function getProjectDueAmount(uint256 projectId) public view returns (uint256) {
        return projectToAmount[projectId];
    }

    function isProjectPaid(uint256 projectId) public view returns (bool) {
        return paidProjects[projectId];
    }

    function withdrawBalance() onlyOwner public {
        payable(owner()).transfer(address(this).balance);
        emit Withdrawn(owner(), address(this).balance);
    }
}
