# Auction Smart Contract

The Auction smart contract is a decentralized application (DApp) that allows users to participate in an auction by placing bids and potentially winning an item or service. The contract is implemented on the Ethereum blockchain and utilizes the Solidity programming language.

# Introduction

The Auction contract provides a decentralized platform for conducting auctions securely and transparently. It allows participants to place bids within a specified duration. The highest bidder at the end of the auction becomes the winner. The contract ensures fairness, prevents double-spending, and provides a mechanism for participants to withdraw their funds if they are not the highest bidder.

# Screen Recording

https://drive.google.com/drive/folders/1QJuUEetC951S7w5Qp6SIl7ueb-bDGGKz?usp=sharing

# Contract Overview

- The Auction contract is built on the Ethereum blockchain and extends the functionality of the OpenZeppelin Ownable contract. The key features and components of the contract include:

  - Starting a new auction: The contract owner can start a new auction by specifying the starting bid, duration, and reserve price. Only the contract owner can initiate the auction.

  - Bidding: Participants can place bids by sending Ether to the contract. Bids must be higher than the current highest bid, and the auction must be ongoing. The highest bidder is updated, and their bid amount becomes the new highest bid.

  - Withdrawing funds: Participants who are outbid can withdraw their funds by calling the withdraw() function. The contract stores the pending returns for each bidder and allows them to be withdrawn at any time.

  - Ending the auction: The contract owner can end the auction before the duration expires. The auction must have started, not already ended, and the highest bid must meet the reserve price. If these conditions are met, the highest bidder receives the item, and their bid amount is transferred to the contract owner.

# Getting Started

## Requirements

[Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
you'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`

[Node](https://nodejs.org/en/)
You'll know you've installed nodejs right if you can run:
`node --version` and get an ouput like: `vx.x.x`

[Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
You'll know you've installed yarn right if you can run:
`yarn --version` and get an output like: `x.x.x`

## Quickstart

`git clone https://github.com/soheilzolfaghari/Auction`

`cd auction`

`cd backend`

`yarn`

## Usage

### Deploy:

On local host:

`yarn hardhat deploy`

On a test net:

1. Setup environment variables

   You'll want to set your `SEPOLIA_RPC_URL` and `PRIVATE_KEY` as environment variables. You can add them to a .env file.
   `PRIVATE_KEY`: The private key of your account (like from metamask).
   `SEPOLIA_RPC_URL`: This is url of the seplia testnet node you're working with. You can get setup with one for free from Alchemy

2. Get testnet ETH
   Head over to faucets.chain.link and get some tesnet ETH. You should see the ETH show up in your metamask.

3. Deploy:
   `yarn hardhat deploy --network sepolia`

### Testing:

`yarn hardhat test`

# Security Considerations

- Use the latest version of the Solidity compiler and related dependencies.

- Be cautious of potential re-entrancy attacks when transferring funds.

- Implement access control mechanisms to ensure only authorized individuals can start and end the auction.

- Consider gas costs and potential scalability issues, especially when dealing with a large number of participants.

# Future Development

As I embark on my first project in blockchain development, this auction solidity contract represents a simple yet foundational starting point. However, I am eager to expand and enhance its capabilities as I continue to gain knowledge and expertise in this space. With future development, I plan to refine the contract, introduce new features, and optimize its performance. This project marks the beginning of my journey from 0 to 100, and I am excited to explore and create more sophisticated solutions in the world of blockchain technology.

# Contributing

Contributions to the Auction contract and its documentation are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

# License

This project is licensed under the MIT License.
