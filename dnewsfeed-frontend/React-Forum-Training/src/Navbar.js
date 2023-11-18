import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ForumState } from './ForumContext';
import { useSDK } from '@metamask/sdk-react';
import { mintTokens, getNumberOfTokens, getTokenContract } from "./web3utils";

const Navbar = ({ is_connexionPage }) => {
  if (is_connexionPage === undefined) is_connexionPage = false;

  const history = useNavigate();
  const { userToken, setUserToken, userAddress, setUserAddress } = ForumState();
  const [userConnected, setUserConnected] = useState(false);
  const { sdk, connected, connecting, provider, chainId } = useSDK();
  const [account, setAccount] = useState(userAddress ? userAddress : null);
  const [numTokens, setNumTokens] = useState(0);
  
  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      console.log(accounts)
      setAccount(accounts?.[0]);
      setUserAddress(accounts?.[0]);
    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  };

  const mintNewsTokens = async () => {
    try{
      mintTokens(account);
    } catch (err) {
      console.warn(`Wallet not connected..`, err);
    }
  }

  const handleDeconnexion = () => {
    console.log('connected ' + userConnected);
    if (userConnected) {
      setUserToken(null);
      history('/');
    }
  };

  useEffect(() => {
    

    const updateTokens = async () => {
        // Assuming you have a method to get the token balance
        const contract = await getTokenContract();
        if (userAddress) {
          const amount = await contract.methods.balanceOf(userAddress).call();
          setNumTokens(amount);
        }
    };

    // Listen for a mint event
    // contract.events.Transfer({
    //     filter: { to: userAddress }, // Optionally filter events
    // })
    // .on('data', (event) => {
    //     updateTokens();
    // })
    // .on('error', console.error);

    // // Initial update
    updateTokens();

    // Cleanup
    return () => {
        // Unsubscribe from events when component unmounts
    };
}, []);

  // This function will be called when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const numTokens = await getNumberOfTokens(userAddress);
        console.log('Num tokens', numTokens);
        setNumTokens(numTokens);
      } catch (err) {
        console.warn(`Wallet not connected..`, err);
      }
    }

      fetchData();
  }, [userAddress]); // The empty

  return (
    <div className="w-screen flex flex-row justify-between">
      <nav className="navbar w-full">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h4 id="logo">BlockiLeaks</h4>
        </Link>
        <div className="flex flex-row justify-center items-center">
          {account && (
            <div style={{ color: "white"}}>
              <div className='flex flex-col h-full'>
                <div>{account && `Connected account: ${account}\n`}</div>
                <div>{numTokens && `Blockileaks tokens: ${numTokens}`}</div>
              </div>
            </div>
          )}
          {
            !account && (
              <button className="px-5 text-white border-2 border-white h-16 w-35 rounded-xl m-2 button-hover" onClick={connect}>
                  Connect
              </button>
            )
          }
        </div>
        <button className="px-5 text-white border-2 border-white h-16 w-35 rounded-xl m-2 button-hover" onClick={mintNewsTokens}>
            Mint tokens
        </button>
      </nav>
    </div>
  );
};

export default Navbar;
