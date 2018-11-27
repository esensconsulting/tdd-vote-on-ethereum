const Vote = artifacts.require('Vote');
const truffleAssert = require('truffle-assertions');

contract('Vote', (accounts) => {
  let contract;
  const ownerAccount = accounts[0];

  // build up and tear down a new Vote contract before each test
  beforeEach(async () => {
    contract = await Vote.new({from: ownerAccount});
  });

  it("should emit a ScrutinCreated event when createScrutin", async () => {
    let newScrutinName = 'new scrutin';
    const tx = await contract.createScrutin(newScrutinName);
    truffleAssert.eventEmitted(tx, "ScrutinCreated", (ev) => {
      return ev._scrutinId.c[0] === 0 && ev._scrutinOwner === ownerAccount && ev._name === newScrutinName;
    });
  });

  it("should emit a ProposalCreated event when createProposal is called on an existing Scrutin", async () => {
    const newScrutinName = 'Best fast food ?';
    let newScrutinId;

    newScrutinId = await scrutinCreated(newScrutinName, ownerAccount);

    const newProposalDescription = 'Macdonalds';
    const txProposal = await contract.createProposal(newScrutinId, newProposalDescription);
    truffleAssert.eventEmitted(txProposal, "ProposalCreated", ev => {
      return ev._propositionId.c[0] === 0 &&
        ev._scrutinId.c[0] === newScrutinId &&
        ev._description === newProposalDescription;
    });
  });

  it("should fail if proposal is submitted on a scrutin that we don't own", async () => {
    const newScrutinName = 'Best fast food ?';
    let newScrutinId;

    let scrutinOwner = accounts[1];
    newScrutinId = await scrutinCreated(newScrutinName, scrutinOwner);
    const newProposalDescription = 'Macdonalds';
    truffleAssert.fails(contract.createProposal(newScrutinId, newProposalDescription));
  });

  it("should emit a VoteSubmitted event if proposal exist", async () => {
    const newScrutinName = 'Best fast food ?';
    let newScrutinId;
    let newProposalId;

    newScrutinId = await scrutinCreated(newScrutinName, ownerAccount);
    const newProposalDescription = 'Macdonalds';
    newProposalId = await proposalCreated(newScrutinId, newProposalDescription);
    const txVoteSubmission = await contract.submitVote(newProposalId);
    truffleAssert.eventEmitted(txVoteSubmission, "VoteSubmitted", ev => {
      return ev._scrutinId.c[0] === newScrutinId &&
        ev._propositionId.c[0] === newProposalId &&
        ev._counter.c[0] === 1;
    });
  });

  it("should fail if user has already voted on a scrutin", async () => {
    const newScrutinName = 'Best fast food ?';
    let newScrutinId;
    let newProposalId;

    newScrutinId = await scrutinCreated(newScrutinName, ownerAccount);
    const newProposalDescription = 'Macdonalds';
    newProposalId = await proposalCreated(newScrutinId, newProposalDescription);
    await contract.submitVote(newProposalId);
    truffleAssert.fails(contract.submitVote(newProposalId));
  });

  async function scrutinCreated(newScrutinName, scrutinOwner) {
    let newScrutinId;
    const tx = await contract.createScrutin(newScrutinName, {from: scrutinOwner});
    truffleAssert.eventEmitted(tx, "ScrutinCreated", ev => {
      newScrutinId = ev._scrutinId.c[0];
      return newScrutinId === 0 && ev._scrutinOwner === scrutinOwner && ev._name === newScrutinName;
    });
    return newScrutinId;
  }

  async function proposalCreated(newScrutinId, newProposalDescription) {
    let newProposalId;
    const txProposal = await contract.createProposal(newScrutinId, newProposalDescription);
    truffleAssert.eventEmitted(txProposal, "ProposalCreated", ev => {
      newProposalId = ev._propositionId.c[0];
      return ev._propositionId.c[0] === 0 &&
        ev._scrutinId.c[0] === newScrutinId &&
        ev._description === newProposalDescription;
    });
    return newProposalId;
  }

  afterEach(async () => {
    await contract.kill({from: ownerAccount});
  });
});
