# BlockiLeaks
A Decentralized Solution to Media Censorship

<img src="https://github.com/zoefleischer/BlockiLeaks/blob/main/LOGO..jpg">

Our project seamlessly integrates various technologies to create a decentralized content platform with a robust and transparent process. Here's a concise technical overview:


## Decentralized Governance Framework:

* Blockileaks introduces a decentralized news DAO governed by a meticulously designed contract. This governance structure outlines key components, including member categorization, criteria for membership acquisition, voting mechanisms, treasury management, and a procedural framework for proposing, approving, and implementing decisions related to future changes in platform architecture.


## Article Submission on React Client:
* Users interact with our React Client to submit articles, initiating the content creation process.

## Truth Verification with UMA:
* An Uma proxy smart contract facilitates the verification process by sending the article title to UMA, leveraging optimistic oracle principles for accurate and reliable validation.

## Decentralized Storage on IPFS via Pinata:
* Simultaneously, article information is securely stored on IPFS using Pinata, an IPFS node provider with designated gateways and a client for efficient file upload and retrieval, ensuring safe and decentralized storage.

## NFT and Token Creation on Ethereum Blockchain:
On the Ethereum blockchain, we deploy two smart contracts:
* ERC721 contract: Mints an NFT containing article information to the owner's wallet upon article submission. It also incorporates up-and downvoting functions for articles.
* ERC20 contract: Generates a native DAO token, ownership of which is required for voting. These tokens can be acquired through purchase or earned by contributing content.
.
## Graph Integration for Frontend Updates:
* To keep the news feed updated, a subgraph listens to events from our smart contracts. Once an event is emitted, the subgraph informs the Frontend, ensuring real-time and accurate updates for users.
