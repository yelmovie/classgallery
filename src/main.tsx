import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GalleryProvider } from './context/GalleryContext';
import { CustomThemeProvider } from './context/CustomThemeContext';
import './app/globals.css';

import HomePage from './app/page';
import ControlPage from './app/control/page';
import DisplayPage from './app/display/page';
import PacksPage from './app/packs/page';
import AdminPage from './app/admin/page';
import NotFoundPage from './app/not-found/page';
import LandscapeOverlay from './components/LandscapeOverlay';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <GalleryProvider>
        <LandscapeOverlay />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/control" element={<ControlPage />} />
            <Route path="/display" element={<DisplayPage />} />
            <Route path="/packs" element={<PacksPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </GalleryProvider>
    </CustomThemeProvider>
  </React.StrictMode>
);
