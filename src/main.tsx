import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GalleryProvider } from './context/GalleryContext';
import './app/globals.css';

import HomePage from './app/page';
import ControlPage from './app/control/page';
import DisplayPage from './app/display/page';
import PacksPage from './app/packs/page';
import LandscapeOverlay from './components/LandscapeOverlay';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GalleryProvider>
      <LandscapeOverlay />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/control" element={<ControlPage />} />
          <Route path="/display" element={<DisplayPage />} />
          <Route path="/packs" element={<PacksPage />} />
        </Routes>
      </BrowserRouter>
    </GalleryProvider>
  </React.StrictMode>
);
