// SPDX-License-Identifier: MIT
// Pragma
pragma solidity ^0.8.20;
// Imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Error Codes
error Auction__AlreadyStarted();
error Auction__NotOwner();
error Auction__NotStarted();
error Auction__AlreadyEnded();
error Auction__BidTooLow();
error Auction__TransferFailed();
error Auction__NotEnded();
error Auction__ReservePriceNotMet();

/**
 * @title Auction
 * @author Soheil Zolfaghari
 * @dev A simple auction contract that allows bidding and withdrawal of funds.
 * The contract is Ownable, meaning that it has an owner who can start and end the auction.
 */
contract Auction is Ownable {
    // State Variables
    uint public s_endAt; // Timestamp at which the auction ends
    uint public s_duration; // Duration of the auction in seconds
    bool public s_started; // Indicates whether the auction has started
    bool public s_ended; // Indicates whether the auction has ended
    uint public s_reservePrice; // Minimum price required to meet the reserve
    address public s_highestBidder; // Address of the highest bidder
    uint public s_highestBid; // Value of the highest bid
    mapping(address => uint) public s_pendingReturns; // Pending returns for each bidder

    // Events
    event Start();
    event Bid(address indexed sender, uint amount);
    event Withdraw(address indexed bidder, uint amount);
    event End(address winner, uint amount);

    // Functions

    /**
     * @dev Constructor function.
     * @param _startingBid The starting bid value for the auction.
     * @param _duration The duration of the auction in seconds.
     * @param _reservePrice The minimum price required to meet the reserve.
     */
    constructor(uint _startingBid, uint _duration, uint _reservePrice) {
        s_highestBid = _startingBid;
        s_duration = _duration;
        s_reservePrice = _reservePrice;
        transferOwnership(msg.sender);
    }

    /**
     * @dev Starts the auction.
     * @notice Only the owner can start the auction.
     */
    function start() external onlyOwner {
        if (s_started) revert Auction__AlreadyStarted();

        s_started = true;
        s_endAt = block.timestamp + s_duration;

        emit Start();
    }

    /**
     * @dev Allows a user to place a bid in the auction.
     * @notice The auction must be started and not ended.
     * @notice The bid amount must be higher than the current highest bid.
     */
    function bid() external payable {
        if (!s_started) revert Auction__NotStarted();
        if (block.timestamp >= s_endAt) revert Auction__AlreadyEnded();
        if (msg.value <= s_highestBid) revert Auction__BidTooLow();

        // Add the current bid to pendingReturns of the previous s_highestBidder
        if (s_highestBidder != address(0)) {
            s_pendingReturns[s_highestBidder] += s_highestBid;
        }

        s_highestBidder = msg.sender;
        s_highestBid = msg.value;

        emit Bid(msg.sender, msg.value);
    }

    /**
     * @dev Allows a bidder to withdraw their pending returns.
     */
    function withdraw() public {
        uint amount = s_pendingReturns[msg.sender];
        if (amount > 0) {
            // Check-Effects-Interactions pattern to prevent re-entrancy attacks
            s_pendingReturns[msg.sender] = 0;
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            if (!success) {
                s_pendingReturns[msg.sender] = amount;
                revert Auction__TransferFailed();
            }
        }
        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Ends the auction and transfers funds to the highest bidder.
     * @notice Only the owner can end the auction.
     * @notice The auction must be started, not ended, and the reserve price must be met.
     */
    function end() external onlyOwner {
        if (!s_started) revert Auction__NotStarted();
        if (block.timestamp < s_endAt) revert Auction__NotEnded();
        if (s_ended) revert Auction__AlreadyEnded();
        if (s_highestBid < s_reservePrice) revert Auction__ReservePriceNotMet();

        s_ended = true;

        if (s_highestBidder != address(0)) {
            (bool success, ) = payable(owner()).call{value: s_highestBid}("");
            if (!success) revert Auction__TransferFailed();
        }

        emit End(s_highestBidder, s_highestBid);
    }
}
