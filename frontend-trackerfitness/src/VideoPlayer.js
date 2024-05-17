// src/VideoPlayer.js
import React from 'react';
import { useLocation } from 'react-router-dom';

const VideoPlayer = () => {
  const location = useLocation();
  const gifUrl = location.state?.videoUrl || '';

  return (
    <div>
      <h1>GIF Player</h1>
      {gifUrl ? (
        <img src={gifUrl} alt="GIF" width="800" height="480" />
      ) : (
        <p>No GIF URL provided.</p>
      )}
    </div>
  );
};

export default VideoPlayer;
