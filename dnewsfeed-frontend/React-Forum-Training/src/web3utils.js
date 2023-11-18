const {Web3} = require('web3');
const fetch = require('node-fetch');
/* global BigInt */

const POLYGONSCAN_API_KEY = "H4RVZJ2J8RFW88DZQW5Q3QCMD1XHQE5Q2R"
async function fetchContractABI(contractAddress) {
    const url = `https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${POLYGONSCAN_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === '1' && data.message === 'OK') {
            return JSON.parse(data.result);
        } else {
            throw new Error(`Error fetching ABI: ${data.result}`);
        }
    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
}
console.log('Initializing web3 utils...');
const newsFeedContractAddress = '0x2c922FF9BA687925512E3Aa8c99B1F0483DeCa04';
const newsTokenContractAddress = '0x58faF3383eE443D5e42FF1525Dd880C31Dd195bB';
const umaProxyContractAddress = '0x303c3e74b1f2500106879940e76FB56D46d16B8E';

async function getMMWeb3() {
    // Check if MetaMask is available
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request access to account
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0]; // Get the first account

            // Create a new Web3 instance using MetaMask's provider
            const web3 = new Web3(window.ethereum);
            return web3;
        } catch (error) {
            console.log('MetaMask is not installed!');
            // Handle the case where the user doesn't have MetaMask
        }
    }   
}

var contracts = {}
async function getTokenContract() {
    if (!contracts.newsTokenContract){
        const web3 = await getMMWeb3();
        const NewsTokenABI = await fetchContractABI(newsTokenContractAddress);
        console.log(NewsTokenABI);
        const newsTokenContract = new web3.eth.Contract(NewsTokenABI, newsTokenContractAddress);
        contracts.newsTokenContract = newsTokenContract;
        return newsTokenContract;
    } else {
        return contracts.newsTokenContract;
    }
}

async function getNewsFeedContract() {
    if (!contracts.newsFeedContract){
        const web3 = await getMMWeb3();
        const NewsFeedABI = await fetchContractABI(newsFeedContractAddress);
        const newsFeedContract = new web3.eth.Contract(NewsFeedABI, newsFeedContractAddress);
        contracts.newsFeedContract = newsFeedContract;
        return newsFeedContract;
    } else {
        return contracts.newsFeedContract;
    }
}

async function getUmaProxyContract() {
    const web3 = await getMMWeb3();
    const umaProxyABI = await fetchContractABI(umaProxyContractAddress);
    const umaProxyContract = new web3.eth.Contract(umaProxyABI, umaProxyContractAddress);
    return umaProxyContract;
}

async function getNumberOfTokens(address) {
    const newsTokenContract = await getTokenContract();    
    const numTokens = await newsTokenContract.methods.balanceOf(address).call();
    return Web3.utils.fromWei(numTokens.toString(), 'ether');
}

async function getNumberOfUpvotes(tokenId) {
    const newsFeedContract = await getNewsFeedContract();
    const numUpvotes = await newsFeedContract.methods.upvotes(tokenId).call();
    return Number(numUpvotes);
}

async function getNumberOfDownvotes(tokenId) {
    const newsFeedContract = await getNewsFeedContract();
    const numDownvotes = await newsFeedContract.methods.downvotes(tokenId).call();
    return Number(numDownvotes);
}

async function getAssertionId(tokenId) {
    const umaProxyContract = await getUmaProxyContract();
    const assertionId = await umaProxyContract.methods.tokenIdToAssertionId(tokenId).call();
    return assertionId;
}

async function waitForTransactionReceipt(web3, txHash) {
    let receipt = null;
    while (receipt === null) {
        receipt = await web3.eth.getTransactionReceipt(txHash);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before checking again
    }
    return receipt;
}

async function isPostVerified(tokenId) {
    var web3 = await getMMWeb3();
    const NewsFeedABI = await fetchContractABI(newsFeedContractAddress);
    const newsFeedContract = new web3.eth.Contract(NewsFeedABI, newsFeedContractAddress);
    const settled = await newsFeedContract.methods.tokenIdToSettled(tokenId).call();
    console.log(settled);
    return Number(settled) === 1;
}

// Mint function
async function mintPost(newsIPFSCid, fromAddress, title) {
    var web3 = await getMMWeb3();
    const NewsFeedABI = await fetchContractABI(newsFeedContractAddress);
    const newsFeedContract = new web3.eth.Contract(NewsFeedABI, newsFeedContractAddress);

    var web3 = await getMMWeb3();
    const newsTokenContractABI = await fetchContractABI(newsTokenContractAddress);
    const newsTokenContract = new web3.eth.Contract(newsTokenContractABI, newsTokenContractAddress);

    const numTokens = Web3.utils.toWei(0.001, 'ether');
    console.log(newsTokenContract, ' approving, ', numTokens, ' tokens to ', newsFeedContractAddress, 'from', fromAddress);

    const approveData = newsTokenContract.methods.approve(newsFeedContractAddress, numTokens).encodeABI();
    const transactionParameters = {
        to: newsTokenContractAddress,
        from: fromAddress,
        data: approveData,
        gas: 1000000
    };

    const approveTxReceipt = await web3.eth.sendTransaction(transactionParameters);

    // Wait for the approve transaction to be mined
    const minedApproveTxReceipt = await waitForTransactionReceipt(web3, approveTxReceipt.transactionHash);
    if (!minedApproveTxReceipt.status) {
        throw new Error("Approve transaction failed");
    }

    console.log('Starting mint call')
    const approvedMintData = newsFeedContract.methods.mint(newsIPFSCid, title).encodeABI();
    const mintTransactionParameters = {
        to: newsFeedContractAddress,
        from: fromAddress,
        data: approvedMintData,
        gas: 1000000
    };
    return await web3.eth.sendTransaction(mintTransactionParameters);
}

// Mint function
async function submitForVerification(tokenId, fromAddress) {
    var web3 = await getMMWeb3();
    const NewsFeedABI = await fetchContractABI(newsFeedContractAddress);
    const newsFeedContract = new web3.eth.Contract(NewsFeedABI, newsFeedContractAddress);

    console.log('Calling verify method on ', tokenId)
    const data = newsFeedContract.methods.verify(tokenId).encodeABI();
    const mintTransactionParameters = {
        to: newsFeedContractAddress,
        from: fromAddress,
        data: data,
        gas: 1000000
    };
    return await web3.eth.sendTransaction(mintTransactionParameters);
}


async function getCurrentNewsSupply() {
    const newsFeedContract = await getNewsFeedContract();
    return await newsFeedContract.methods.totalSupply().call();
}

// Upvote function
async function upvote(tokenId, fromAddress) {
    console.log('Upvoting token', tokenId, 'from address', fromAddress)
    const web3 = await getMMWeb3();
    const NewsFeedABI = await fetchContractABI(newsFeedContractAddress);
    const newsFeedContract = new web3.eth.Contract(NewsFeedABI, newsFeedContractAddress);
    const approvedMintData = newsFeedContract.methods.upvote(tokenId).encodeABI();
    const mintTransactionParameters = {
        to: newsFeedContractAddress,
        from: fromAddress,
        data: approvedMintData,
        gas: 1000000
    };
    return await web3.eth.sendTransaction(mintTransactionParameters);
}

// Downvote function
async function downvote(tokenId, fromAddress) {
    console.log('Downvoting token', tokenId, 'from address', fromAddress)
    const web3 = await getMMWeb3();
    const NewsFeedABI = await fetchContractABI(newsFeedContractAddress);
    const newsFeedContract = new web3.eth.Contract(NewsFeedABI, newsFeedContractAddress);
    const approvedMintData = newsFeedContract.methods.downvote(tokenId).encodeABI();
    const mintTransactionParameters = {
        to: newsFeedContractAddress,
        from: fromAddress,
        data: approvedMintData,
        gas: 1000000
    };
    return await web3.eth.sendTransaction(mintTransactionParameters);

}

// Mint function
async function mintTokens(toAddress) {
    try {
        const web3 = await getMMWeb3();

        // Fetch ABI and create contract instance
        const NewsTokenABI = await fetchContractABI(newsTokenContractAddress);
        const dnewsTokenContract = new web3.eth.Contract(NewsTokenABI, newsTokenContractAddress);

        // Define transaction parameters
        const valueInWei = web3.utils.toWei('0.0001', 'ether');

        // Execute the transaction
        console.log('Minting tokens to ', toAddress, 'for ', valueInWei, 'from address ', newsTokenContractAddress);
        const data = dnewsTokenContract.methods.mint().encodeABI();
        const mintTransactionParameters = {
            to: newsTokenContractAddress,
            from: toAddress,
            data: data,
            value: valueInWei,
            gas: 1000000
        };
        return await web3.eth.sendTransaction(mintTransactionParameters);
        // dnewsTokenContract.methods.mint().send({from: toAddress, value: valueInWei});
    } catch (error) {
        console.error('Error:', error);
        // Handle errors (e.g., user denied account access)
    }
}


// Export the functions for use in other modules
module.exports = {
    mintPost,
    upvote,
    downvote,
    mintTokens,
    getNumberOfTokens,
    getCurrentNewsSupply,
    getNumberOfDownvotes,
    getNumberOfUpvotes,
    submitForVerification,
    getAssertionId,
    getTokenContract,
    isPostVerified
};
