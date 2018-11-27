pragma solidity ^0.4.24;

contract Vote {
    address public owner;

    struct Scrutin {
        string name;
        address scrutinOwner;
        bool isStarted;
    }

    struct Proposition {
        uint scrutinId;
        string description;
        uint counter;
    }

    Scrutin[] public scrutins;
    Proposition[] propositions;

    mapping(address => mapping(uint => bool)) private isScrutinVoted;

    event VoteSubmitted(uint _scrutinId, uint _propositionId, uint _counter);
    event ScrutinCreated(uint _scrutinId, string _name, address _scrutinOwner);
    event ProposalCreated(uint _propositionId, uint _scrutinId, string _description);

    constructor() public {
        owner = msg.sender;
    }

    function kill() external {
        require(msg.sender == owner, "Only the owner can kill this contract");
        selfdestruct(owner);
    }

    function createScrutin(string _name) public {
        uint _scrutinId = scrutins.push(Scrutin(_name, msg.sender, false)) - 1;
        emit ScrutinCreated(_scrutinId, _name, msg.sender);
    }

    function createProposal(uint _scrutinId, string _description) public {
        Scrutin storage scrutin = scrutins[_scrutinId];
        require(scrutin.scrutinOwner == msg.sender);
        uint _propositionId = propositions.push(Proposition(_scrutinId, _description, 0)) - 1;
        emit ProposalCreated(_propositionId, _scrutinId, _description);
    }

    function submitVote(uint _propositionId) public {
        Proposition storage proposition = propositions[_propositionId];
        require(isScrutinVoted[msg.sender][proposition.scrutinId] == false);
        proposition.counter++;
        isScrutinVoted[msg.sender][proposition.scrutinId] = true;
        emit VoteSubmitted(proposition.scrutinId, _propositionId, proposition.counter);
    }
}
