// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChainOfCustody {
    struct CustodyEvent {
        uint evidenceId;
        address actor;
        string action;
        string dataHash;
        uint timestamp;
    }

    mapping(uint => CustodyEvent[]) public custodyEvents;

    event EventLogged(
        uint evidenceId,
        address actor,
        string action,
        string dataHash,
        uint timestamp
    );

    function logEvent(
        uint _evidenceId,
        string memory _action,
        string memory _dataHash
    ) public {
        CustodyEvent memory newEvent = CustodyEvent({
            evidenceId: _evidenceId,
            actor: msg.sender,
            action: _action,
            dataHash: _dataHash,
            timestamp: block.timestamp
        });

        custodyEvents[_evidenceId].push(newEvent);

        emit EventLogged(
            _evidenceId,
            msg.sender,
            _action,
            _dataHash,
            block.timestamp
        );
    }

    function getEvents(uint _evidenceId) public view returns (CustodyEvent[] memory) {
        return custodyEvents[_evidenceId];
    }
}