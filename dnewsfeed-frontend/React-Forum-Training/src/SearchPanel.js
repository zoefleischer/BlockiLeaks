import { Link, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ForumState } from "./ForumContext";

const SearchPanel = ({ search, next, previous }) => {
  const history = useNavigate();
  const { userToken, userAddress } = ForumState();
  
  const handleCreatePost = () => {
    if (userAddress) history("create-post");
    else history("connexion");
  };

  return (
    <div className="search-container">
      <button onClick={previous}>{`<`}</button>
      <div className="search-box">
        <input
          onChange={search}
          type="text"
          className="input-search"
          placeholder="Search..."
        />
      </div>
      <button onClick={handleCreatePost} id="create-post-btn">
        + Create a post{" "}
      </button>
      <button onClick={next}>{`>`}</button>
    </div>
  );
};

export default SearchPanel;
