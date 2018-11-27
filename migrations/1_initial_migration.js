var Migrations = artifacts.require("./Migrations.sol");
var Vote = artifacts.require("./Vote.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Vote);
};
