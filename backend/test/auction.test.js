const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction", function () {
  let auction;
  let owner;
  let bidder1;
  let bidder2;

  beforeEach(async function () {
    const Auction = await ethers.getContractFactory("Auction");
    auction = await Auction.deploy(100, 3600, 500);

    [owner, bidder1, bidder2] = await ethers.getSigners();
  });

  it("should start the auction", async function () {
    await auction.connect(owner).start();
    const s_started = await auction.s_started();
    expect(s_started).to.equal(true);
  });

  it("should not allow bidding before the auction starts", async function () {
    const bidAmount = ethers.parseEther("1");
    await expect(
      auction.connect(bidder1).bid({ value: bidAmount })
    ).to.be.revertedWithCustomError(auction, "Auction__NotStarted");
  });

  it("should not allow non-owners to start the auction", async function () {
    await expect(auction.connect(bidder1).start()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("should allow bidding and update the highest bid", async function () {
    await auction.connect(owner).start();

    const bidAmount1 = ethers.parseEther("1");
    await auction.connect(bidder1).bid({ value: bidAmount1 });
    const highestBidder1 = await auction.s_highestBidder();
    const highestBid1 = await auction.s_highestBid();
    expect(highestBidder1).to.equal(bidder1.address);
    expect(highestBid1).to.equal(bidAmount1);

    const bidAmount2 = ethers.parseEther("2");
    await auction.connect(bidder2).bid({ value: bidAmount2 });
    const highestBidder2 = await auction.s_highestBidder();
    const highestBid2 = await auction.s_highestBid();
    expect(highestBidder2).to.equal(bidder2.address);
    expect(highestBid2).to.equal(bidAmount2);
  });

  it("should revert when bidding is below the highest bid", async function () {
    await auction.connect(owner).start();
    const bidAmount1 = ethers.parseEther("2");
    await auction.connect(bidder1).bid({ value: bidAmount1 });

    const bidAmount2 = ethers.parseEther("1");
    await expect(
      auction.connect(bidder2).bid({ value: bidAmount2 })
    ).to.be.revertedWithCustomError(auction, "Auction__BidTooLow");
  });

  it("should not allow bidding after the auction ends", async function () {
    await auction.connect(owner).start();
    await network.provider.send("evm_increaseTime", [3601]);

    const bidAmount = ethers.parseEther("1");
    await expect(
      auction.connect(bidder1).bid({ value: bidAmount })
    ).to.be.revertedWithCustomError(auction, "Auction__AlreadyEnded");
  });

  it("should revert when trying to end an auction before it starts", async function () {
    await expect(auction.connect(owner).end()).to.be.revertedWithCustomError(
      auction,
      "Auction__NotStarted"
    );
  });

  it("should revert when trying to end an auction before the end time", async function () {
    await auction.connect(owner).start();
    await expect(auction.connect(owner).end()).to.be.revertedWithCustomError(
      auction,
      "Auction__NotEnded"
    );
  });
});
