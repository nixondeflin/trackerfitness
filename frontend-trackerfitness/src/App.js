import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider, CSSReset, Box } from '@chakra-ui/react';
import Home from './Home';
import UploadVideo from './UploadVideo';
import ProcessedVideosList from './ProcessedVideosList';

const App = () => {
  return (
    <ChakraProvider>
      <CSSReset />
      <Box textAlign="center" fontSize="xl">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/uploadvideo" element={<UploadVideo />} />
            <Route path="/processed-videos" element={<ProcessedVideosList />} />
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  );
};

export default App;
