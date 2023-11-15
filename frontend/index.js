export const eventNames = {
  bid: "Bid",
  withdraw: "Withdraw",
  end: "End",
};

import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const startButton = document.getElementById("startButton");
const bidButton = document.getElementById("bidButton");
const withdrawButton = document.getElementById("withdrawButton");
const endButton = document.getElementById("endButton");
const countdownTimer = document.getElementById("countdownTimer");

const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, abi, signer);

connectButton.addEventListener("click", connect);
startButton.addEventListener("click", startAuction);
bidButton.addEventListener("click", placeBid);
withdrawButton.addEventListener("click", withdraw);
endButton.addEventListener("click", endAuction);

let auctionEndTimestamp;

console.log(ethers);

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected";
    subscribeToEvents();
  } else {
    connectButton.innerHTML = "Please Install MetaMask";
  }
}

async function startAuction() {
  console.log("Starting the auction...");
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.start();
      await transactionResponse.wait();
      console.log("Auction started successfully!");

      auctionEndTimestamp = Date.now() + 90000; // (adjust as needed)
      startCountdown();
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("Please install MetaMask or a compatible Ethereum provider.");
  }
}

function startCountdown() {
  const countdownInterval = setInterval(() => {
    const remainingTime = auctionEndTimestamp - Date.now();

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownTimer.innerHTML = "Auction Ended";
      return;
    }

    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    countdownTimer.innerHTML = `Time Remaining: ${minutes}m ${seconds}s`;
  }, 1000);
}
async function placeBid() {
  const bidAmountInput = document.getElementById("bidAmountInput");
  const bidAmount = bidAmountInput.value;
  console.log("Placing a bid...");
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.bid({
        value: ethers.utils.parseEther(bidAmount),
      });
      await transactionResponse.wait();
      console.log("Bid placed successfully!");
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("Please install MetaMask or a compatible Ethereum provider.");
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

async function endAuction() {
  console.log("Ending the auction...");
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      await contract.end();
      console.log("Auction ended successfully.");
    } catch (error) {
      console.log("Error occurred while ending the auction:", error);
    }
  }
}

async function subscribeToEvents() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    contract.on(eventNames.bid, (sender, amount) => {
      console.log(`Bid event: Sender: ${sender}, Amount: ${amount}`);
    });

    contract.on(eventNames.withdraw, (bidder, amount) => {
      console.log(`Withdraw event: Bidder: ${bidder}, Amount: ${amount}`);
    });

    contract.on(eventNames.end, (winner, amount) => {
      console.log(`End event: Winner: ${winner} , Amount: ${amount}`);
    });
  }
}
