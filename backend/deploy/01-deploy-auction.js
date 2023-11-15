const { verify } = require("../utils/verify");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  //const chainId = network.config.chainId;
  let _startingBid = 1;
  let _duration = 90;
  let _reservePrice = 5;

  //Deploying the contract

  log("Deploying Auction...");

  const arguments = [_startingBid, _duration, _reservePrice];

  const auction = await deploy("Auction", {
    from: deployer,
    args: arguments,
    log: true,
  });
  log(`Auctoin deployed at ${auction.address}`);

  //Verifying the contract

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(auction.address, arguments);
  }
};

module.exports.tags = ["all", "auction"];
