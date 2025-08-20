// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleSettlement {
    event Settled(address indexed participant, uint256 amount);

    function settle(bytes calldata signedState) external {
        emit Settled(msg.sender, 0);
    }
}
