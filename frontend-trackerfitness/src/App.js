// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import UploadVideo from './UploadVideo';
import VideoPlayer from './VideoPlayer';
import ProcessedVideosList from './ProcessedVideosList';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Upload Video</Link>
            </li>
            <li>
              <Link to="/video-player">Video Player</Link>
            </li>
            <li>
              <Link to="/processed-videos">Processed Videos List</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<UploadVideo />} />
          <Route path="/video-player" element={<VideoPlayer />} />
          <Route path="/processed-videos" element={<ProcessedVideosList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
