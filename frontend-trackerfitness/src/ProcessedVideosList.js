// src/ProcessedVideosList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProcessedVideosList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('https://trackerfit-423405.as.r.appspot.com/get_video/');
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <h1>Processed Videos List</h1>
      <ul>
        {videos.map((video, index) => (
          <li key={index}>
            <a href={`https://trackerfit-423405.as.r.appspot.com/get_video/?file_name=${video}`} target="_blank" rel="noopener noreferrer">
              {video}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProcessedVideosList;
