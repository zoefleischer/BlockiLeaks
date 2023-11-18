import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
const appendLeadingZeroes = (value) => {
  if (value <= 9) {
    return "0" + value;
  }
  return value;
};

const convertDate = (date) => {
  let current_datetime = new Date(date);
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    appendLeadingZeroes(current_datetime.getMonth() + 1) +
    "-" +
    appendLeadingZeroes(current_datetime.getDate()) +
    " " +
    appendLeadingZeroes(current_datetime.getHours()) +
    ":" +
    appendLeadingZeroes(current_datetime.getMinutes()) +
    ":" +
    appendLeadingZeroes(current_datetime.getSeconds());
  return formatted_date;
};

const getImageIpfsUrl = async (cid) => {
// Upload image to Pinata/IPFS
  const metadataRes = await fetch('https://gateway.pinata.cloud/ipfs/' + cid.toString(), {
    method: 'GET'
  });
  if (!metadataRes.ok) throw new Error('Get metadata from Pinata failed');
  return 'https://gateway.pinata.cloud/ipfs/' + JSON.parse(await metadataRes.text()).imageCID.toString();
}

const Post = ({ post }) => {
  const { _id, author, title, content, last_update, category, responces, tokenId, approved, imageCID } = post;
  const [imageUrl, setImageUrl] = useState('');

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

  return (
    <Link
      to={`/posts/${_id}`}
      state={post}
      className="post-link"
      style={{ textDecoration: "none" }}
    >
      <div className="post-container w-full">
        <p className="w-full mb-5 text-wrap"> {title}</p>
        {imageUrl && <img src={imageUrl} alt="post image" className="mx-auto post-image mt-5" />}
        <p className="post-field text-xs"><span className="text-gray">Author:</span> {author}</p>
        <p className="post-field"><span className="text-gray">TokenId:</span> {tokenId}</p>
        <p className="post-field"><span className="text-gray">Verified:</span> {approved.toString()}</p>
        
      </div>
    </Link>
  );
};

export default Post;
