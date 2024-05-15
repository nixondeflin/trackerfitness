// src/VideoPlayer.js
import React from 'react';
import { useLocation } from 'react-router-dom';

const VideoPlayer = () => {
  const location = useLocation();
  const videoUrl = location.state?.videoUrl || '';

  return (
    <div>
      <h1>Video Player</h1>
      {videoUrl ? (
        <video width="800" height="480" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>No video URL provided.</p>
      )}
    </div>
  );
};

export default VideoPlayer;
