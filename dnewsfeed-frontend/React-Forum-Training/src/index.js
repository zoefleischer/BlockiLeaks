import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Connexion from './Connexion';
import SignIn from './SignIn';
import CreatePost from './CreatePost';
import FullPost from './FullPost';
import ForumContext from './ForumContext';
import { MetaMaskProvider } from '@metamask/sdk-react';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ForumContext>
    <BrowserRouter>
      <MetaMaskProvider
        debug={false}
        sdkOptions={{
          checkInstallationImmediately: false,
          dappMetadata: {
            name: 'Demo React App',
            url: window.location.host,
          },
        }}
      >
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/Sign-in" element={<SignIn />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/posts/:id" element={<FullPost />} />
        </Routes>
      </MetaMaskProvider>
    </BrowserRouter>
  </ForumContext>
);
