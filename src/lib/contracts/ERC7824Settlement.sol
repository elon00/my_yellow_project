// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ERC7824Settlement
 * @dev Yellow Network ERC-7824 Off-Chain State Channel Settlement & Dispute Contract.
 * Allows multi-party state channel cooperative closing and dispute challenge period.
 */
contract ERC7824Settlement {
    struct ChannelSession {
        bytes32 sessionId;
        bytes32 appId;
        uint64 seq;
        bytes32 stateHash;
        uint64 disputeDeadline;
        bool isClosed;
    }

    // Session ID => Channel Session State
    mapping(bytes32 => ChannelSession) public sessions;
    
    // Session ID => Participant => Balance
    mapping(bytes32 => mapping(address => uint256)) public sessionBalances;

    event SessionOpened(bytes32 indexed sessionId, bytes32 indexed appId, address[] participants);
    event StateProposed(bytes32 indexed sessionId, uint64 indexed seq, bytes32 stateHash);
    event DisputeChallenged(bytes32 indexed sessionId, uint64 newSeq, address challenger);
    event SessionSettled(bytes32 indexed sessionId, uint64 finalSeq, uint256 totalAmountSettled);

    uint64 public constant DISPUTE_WINDOW_SECONDS = 86400; // 24-hour challenge window

    /**
     * @notice Cooperative Settlement: Closes channel immediately if signed by all channel participants.
     */
    function cooperativeSettle(
        bytes32 sessionId,
        uint64 finalSeq,
        address[] calldata participants,
        uint256[] calldata balances,
        bytes[] calldata signatures
    ) external {
        require(participants.length == balances.length, "Length mismatch");
        require(participants.length == signatures.length, "Signatures mismatch");
        
        ChannelSession storage session = sessions[sessionId];
        require(!session.isClosed, "Session already closed");
        require(finalSeq > session.seq, "Sequence must be higher");

        bytes32 stateHash = keccak256(abi.encodePacked(sessionId, finalSeq, participants, balances));
        
        // Verify EIP-712 signatures for each participant
        for (uint256 i = 0; i < participants.length; i++) {
            address recovered = recoverSigner(stateHash, signatures[i]);
            require(recovered == participants[i], "Invalid signature");
            sessionBalances[sessionId][participants[i]] = balances[i];
        }

        session.seq = finalSeq;
        session.stateHash = stateHash;
        session.isClosed = true;

        emit SessionSettled(sessionId, finalSeq, getTotal(balances));
    }

    /**
     * @notice Initiates a unilateral dispute challenge using the highest sequence number available.
     */
    function challengeDispute(
        bytes32 sessionId,
        uint64 proposedSeq,
        address[] calldata participants,
        uint256[] calldata balances,
        bytes calldata signature
    ) external {
        ChannelSession storage session = sessions[sessionId];
        require(!session.isClosed, "Session closed");
        require(proposedSeq > session.seq, "Stale sequence number");

        bytes32 stateHash = keccak256(abi.encodePacked(sessionId, proposedSeq, participants, balances));
        address recovered = recoverSigner(stateHash, signature);
        require(isParticipant(participants, recovered), "Signer not participant");

        session.seq = proposedSeq;
        session.stateHash = stateHash;
        session.disputeDeadline = uint64(block.timestamp + DISPUTE_WINDOW_SECONDS);

        emit DisputeChallenged(sessionId, proposedSeq, msg.sender);
    }

    function isParticipant(address[] memory list, address query) internal pure returns (bool) {
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == query) return true;
        }
        return false;
    }

    function recoverSigner(bytes32 hash, bytes memory sig) internal pure returns (address) {
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(sig);
        return ecrecover(ethSignedHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function getTotal(uint256[] calldata arr) internal pure returns (uint256 total) {
        for (uint256 i = 0; i < arr.length; i++) {
            total += arr[i];
        }
    }
}
