import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState } from "react";
import { ForumState } from "./ForumContext";
import { mintPost, getCurrentNewsSupply } from "./web3utils";

const CreatePost = () => {
  const history = useNavigate();
  const { userAddress, userToken } = ForumState();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // New state for the image
  const [creating, setCreating] = useState(false); // New state for the post creation status
  const [uploadingImageToIpfs, setUploadingImageToIpfs] = useState(false); // New state for the image upload status
  const [uploadingMetadataToIpfs, setUploadingMetadataToIpfs] = useState(false); // New state for the metadata upload status
  const [mintingToken, setMintingToken] = useState(false); // New state for the token minting status

  // Function to upload image to IPFS and create post
  const handleClick = async (title, content, category, imageFile) => {
    setCreating(true);
    setUploadingImageToIpfs(true);
    
    if (!imageFile) {
      alert("Please select an image to upload.");
      return;
    }

    if(!userAddress){
      alert("Please connect to create a post");
      return;
    }


    // Create form data for the image file
    const formData = new FormData();
    formData.append('file', imageFile);

    // Set up the headers for the Pinata API call
    const pinataHeaders = {
      pinata_api_key: 'e390f35a68a3ebbbc71b',
      pinata_secret_api_key: '5cdddc7e486392c8ff0d73189cd5333e167619cd42e0b63cdb363977851e5ec8',
    };

    try {
      // Upload image to Pinata/IPFS
      const imgRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: pinataHeaders,
        body: formData,
      });

      if (!imgRes.ok) throw new Error('Image upload to Pinata failed');

      setUploadingImageToIpfs(false);
      setUploadingMetadataToIpfs(true);

      // Get image CID from Pinata response
      const imageCid = await imgRes.json();

      // Prepare the post data
      const post = {
        title,
        author: userAddress,
        content,
        category,
        imageCID: imageCid.IpfsHash, // Assuming the response contains an IpfsHash field
      };

      // Upload post data to Pinata/IPFS
      const postRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...pinataHeaders,
        },
        body: JSON.stringify(post),
      });

      if (!postRes.ok) throw new Error('Post data upload to Pinata failed');

      setUploadingMetadataToIpfs(false);
      setMintingToken(true);

      // Get post CID from Pinata response
      const postResp = await postRes.json();
      const finalCid = postResp.IpfsHash;

      if(!finalCid) throw new Error('Missing final CID');
      console.log('Final cid is', finalCid);


      // Mint a new token
      
      await mintPost(finalCid.toString(), userAddress, title);

      const tokenId = await getCurrentNewsSupply();
      console.log('Token id is', tokenId);

      setMintingToken(false);

      // Here you can handle the CIDs as needed, e.g., saving them to your database
      var body = {
        author: userAddress,
        title: title,
        content: content,
        category: category,
        imageCID: finalCid,
        responces: [],
        tokenId: Number(tokenId),
        approved: false
      };

      const postResponse = await fetch('/posts/create-new-post', {
        method: 'POST',
        headers: {
          'auth-token': userToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
      });

      console.log(postResponse);

      if (!postResponse.ok){
        console.log(postResponse);
        throw new Error('Post data upload to MongoDB failed');
      }

      setCreating(false);
      // After successful uploads, redirect or refresh the page as needed
      history('/');
      // history(0);
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      alert('There was an error creating your post.');
    }
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  return (
    <>
      <Navbar buttonValue={"Connect"} linkValue={"connexion"} />
      {uploadingImageToIpfs && <p className="create-post-container text-white text-xxl">Uploading image to IPFS...</p>}
      {uploadingMetadataToIpfs && <p className="create-post-container text-white text-xxl">Uploading metadata to IPFS...</p>}
      {mintingToken && <p className="create-post-container text-white text-xxl">Minting token...</p>}
      {!creating && <div className="create-post-container">
        <h2>Create your post</h2>
        <p>Title</p>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          type="text"
          placeholder="The title of your post. This will be the assertion that is verified."
          style = {
            {
              width: '50%',
              height: '50px',
              fontSize: '20px',
              padding: '10px'
            }
          }
        />

        <div className="flex flex-row h-1/2 w-1/2 justify-center items-center">
            <div className="flex flex-col text-black h-full w-2/3 mr-10">
              <p className="text-white">Content</p>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="h-full w-full rounded-xl mb-10"
              />
            </div>
            <div className="flex flex-col text-white">
              <p>Image</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ padding: '30px' }}
              />
            </div>
        </div>
        <button
          id="create-post-btn"
          onClick={async () => await handleClick(title, content, "Voyage", image)}
        >
          Create
        </button>
      </div>}
    </>
  );
};

export default CreatePost;
