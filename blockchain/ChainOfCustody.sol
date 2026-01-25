// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChainOfCustody {
    struct CustodyEvent {
        uint evidenceId;
        address actor;
        string action;
        uint timestamp;
    }

    mapping(uint => CustodyEvent[]) public custodyEvents;

    event EventLogged(uint evidenceId, address actor, string action, uint timestamp);

    // Add new event
    function logEvent(uint _evidenceId, string memory _action) public {
        CustodyEvent memory newEvent = CustodyEvent({
            evidenceId: _evidenceId,
            actor: msg.sender,
            action: _action,
            timestamp: block.timestamp
        });

        custodyEvents[_evidenceId].push(newEvent);
        emit EventLogged(_evidenceId, msg.sender, _action, block.timestamp);
    }

    // Get events by evidence ID
    function getEvents(uint _evidenceId) public view returns (CustodyEvent[] memory) {
        return custodyEvents[_evidenceId];
    }
}
