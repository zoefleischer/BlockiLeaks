import React, { createContext, useContext, useEffect, useState } from "react";

const Forum = createContext();

const ForumContext = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  return (
    <Forum.Provider value={{ userToken, setUserToken, userName, setUserName, userAddress, setUserAddress }}>
      {children}
    </Forum.Provider>
  );
};

export default ForumContext;

export const ForumState = () => {
  return useContext(Forum);
};
