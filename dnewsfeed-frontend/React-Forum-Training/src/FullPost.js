import { useLocation, useParams } from "react-router-dom";
import Message from "./Message";
import Navbar from "./Navbar";
import Responce from "./Responce";
import { upvote, downvote, submitForVerification, getAssertionId, isPostVerified} from "./web3utils";
import { ForumState } from './ForumContext';
import { useState, useEffect } from "react";

const FullPost = () => {
  const { userAddress } = ForumState();
  const post = useLocation().state;
  const [upvotes,setUpvotes] = useState(0);
  const [downvotes,setDownvotes] = useState(0);
  const [assertionId, setAssertionId] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const {
    _id,
    author,
    title,
    content,
    last_update,
    response_number,
    category,
    responces,
    tokenId,
    approved,
    imageCID
  } = post;
  const [imageUrl, setImageUrl] = useState('');
  const getImageIpfsUrl = async (cid) => {
    // Upload image to Pinata/IPFS
      const metadataRes = await fetch('https://gateway.pinata.cloud/ipfs/' + cid.toString(), {
        method: 'GET'
      });
      if (!metadataRes.ok) throw new Error('Get metadata from Pinata failed');
      return 'https://gateway.pinata.cloud/ipfs/' + JSON.parse(await metadataRes.text()).imageCID.toString();
    }

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await getImageIpfsUrl(imageCID);
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to load image from IPFS:", error);
        // Handle error or set a default image
      }
    };

    fetchImage();
  }, [imageCID]); // useEffect will re-run if imageCID changes

  const upvotePost = async () => {
    await upvote(tokenId, userAddress)
  }

  const downvotePost = async () => {
    await downvote(tokenId, userAddress)
  }

  const submitPostForVerification = async () => {
    submitForVerification(tokenId, userAddress);
  }


  useEffect(() => {
    async function fetchData() {
      // setUpvotes(await getNumberOfUpvotes(tokenId));
      // setDownvotes(await getNumberOfDownvotes(tokenId));
      console.log('Getting assertion id for token', tokenId)
      setAssertionId(await getAssertionId(tokenId));
      setIsVerified(await isPostVerified(tokenId));
    }
    fetchData();
  }, []);



  return (
    <div className="flex flex-col items-center justify-between h-full">
      <Navbar buttonValue={"Connect"} linkValue={"connexion"} />
      <div className="full-post-container w-3/5 h-full">
        <h3 className={`mt-10 text-xxxl ${isVerified ? 'text-green-500' : 'text-red-500'}`}>{isVerified ? "Verified" : "Not verified"}</h3>
        <h2>{title}</h2>
        <h3 className="text-white">Author: {author}</h3>
        <h3 className="text-white">Assertion ID: {assertionId}</h3>
        {!isVerified && <button className="px-5 text-white border-2 border-white h-16 w-35 rounded-xl m-2 button-hover" onClick={submitPostForVerification}>
            Verify
        </button>}
        <div className="flex flex-row h-full w-full mt-10">
          {imageUrl && <img src={imageUrl} alt="post image" className="mx-auto post-image mt-5 mr-10" />}
          <div className="topic-container">
            <p>{content}</p>
          </div>
          <div className="text-white h-full flex flex-col justify-between items-center">
              <button className="px-5 text-white border-2 border-white h-16 w-35 rounded-xl m-2 button-hover" onClick={upvotePost}>
                  +{upvotes}
              </button>
              <button className="px-5 text-white border-2 border-white h-16 w-35 rounded-xl m-2 button-hover" onClick={downvotePost}>
                  -{downvotes}
              </button>
          </div>
        </div>
        {/* {responces.map((responce) => (
          <Message responce={responce} key={responce.id} />
        ))} */}
        {/* <div className="line" /> */}
        {/* <Responce id_={_id} /> */}
      </div>
    </div>
  );
};

export default FullPost;
