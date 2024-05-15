import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadVideo = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [exerciseType, setExerciseType] = useState('');
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleExerciseTypeChange = (event) => {
    setExerciseType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !exerciseType) {
      alert('Please select a file and exercise type.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('exercise_type', exerciseType);

    try {
      const response = await axios.post('https://trackerfit-423405.as.r.appspot.com/analyze_exercise', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadResponse(response.data);
      console.log('Upload successful, response:', response.data);  // Print the response
      alert('Upload successful!');
      // Navigate to the video player component with the public URL from the response
      navigate('/video-player', { state: { videoUrl: response.data.output_file } });
    } catch (error) {
      console.error('Error uploading video:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        alert(`Error uploading video: ${error.response.statusText}`);
      } else if (error.request) {
        console.error('Request data:', error.request);
        alert('Error uploading video: No response received from server.');
      } else {
        console.error('Error message:', error.message);
        alert(`Error uploading video: ${error.message}`);
      }
      setError('Error uploading video: ' + error.message);
      setUploadResponse(null);
    }
  };

  return (
    <div>
      <h1>Upload Exercise Video</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={handleFileChange} required />
        <input type="text" value={exerciseType} onChange={handleExerciseTypeChange} placeholder="Exercise Type" required />
        <button type="submit">Upload</button>
      </form>
      {uploadResponse && (
        <div>
          <h2>Upload Response</h2>
          <pre>{JSON.stringify(uploadResponse, null, 2)}</pre>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UploadVideo;
