// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChainOfCustody {

    // =========================
    // STRUCT
    // =========================
    struct CustodyEvent {
        uint256 evidenceId;
        string action;
        address actor;
        string dataHash;
        uint256 timestamp;
    }

    // =========================
    // STORAGE
    // =========================
    CustodyEvent[] public custodyEvents;

    // =========================
    // EVENT (for blockchain logs)
    // =========================
    event CustodyRecorded(
        uint256 indexed evidenceId,
        string action,
        address indexed actor,
        string dataHash,
        uint256 timestamp
    );

    // =========================
    // WRITE FUNCTION
    // =========================
    function recordCustodyEvent(
        uint256 _evidenceId,
        string memory _action,
        string memory _dataHash
    ) public {

        CustodyEvent memory newEvent = CustodyEvent({
            evidenceId: _evidenceId,
            action: _action,
            actor: msg.sender,
            dataHash: _dataHash,
            timestamp: block.timestamp
        });

        custodyEvents.push(newEvent);

        emit CustodyRecorded(
            _evidenceId,
            _action,
            msg.sender,
            _dataHash,
            block.timestamp
        );
    }

    // =========================
    // READ FUNCTION
    // =========================
    function getCustodyCount() public view returns (uint256) {
        return custodyEvents.length;
    }

    function getCustodyEvent(uint256 index)
        public
        view
        returns (
            uint256,
            string memory,
            address,
            string memory,
            uint256
        )
    {
        CustodyEvent memory e = custodyEvents[index];
        return (
            e.evidenceId,
            e.action,
            e.actor,
            e.dataHash,
            e.timestamp
        );
    }
}
