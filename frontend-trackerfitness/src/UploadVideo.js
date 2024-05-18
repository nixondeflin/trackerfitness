import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Image,
  useToast,
  Flex,
  VStack,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import loadingGif from './assets/loading.gif'; // Correct path to the GIF

const UploadVideo = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [exerciseType, setExerciseType] = useState('');
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleExerciseTypeChange = (event) => {
    setExerciseType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !exerciseType) {
      toast({
        title: 'Error',
        description: 'Please select a file and exercise type.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    setIsLoading(true);
  
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('exercise_type', exerciseType);
  
    try {
      const response = await axios.post('/api/analyze_exercise', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadResponse(response.data);
      console.log('Upload successful, response:', response.data);
      toast({
        title: 'Upload successful',
        description: 'Your video has been uploaded and processed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        toast({
          title: 'Error uploading video',
          description: error.response.statusText,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (error.request) {
        console.error('Request data:', error.request);
        toast({
          title: 'Error uploading video',
          description: 'No response received from server.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.error('Error message:', error.message);
        toast({
          title: 'Error uploading video',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      setError('Error uploading video: ' + error.message);
      setUploadResponse(null);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Box
      p={4}
      height="200vh"
      bgGradient="linear(to-b, #0f0c29, #302b63)"
      color="white"
    >
      <Flex justify="flex-start" mb={4}>
        <Button as={NavLink} to="/" bgColor="#E94057" color="white" width="10rem" margin="4" _hover={{ bgColor: "#751B6C" }}>
          Home
        </Button>
      </Flex>
      <Flex direction="column" align="center" justify="center">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Upload Exercise Video
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="center">
            <FormControl id="file">
              <FormLabel>Video File</FormLabel>
              <Input type="file" accept="video/*" onChange={handleFileChange} required />
            </FormControl>
            <FormControl id="exerciseType">
              <FormLabel>Exercise Type</FormLabel>
              <Input
                type="text"
                value={exerciseType}
                onChange={handleExerciseTypeChange}
                placeholder="Exercise Type"
                required
              />
            </FormControl>
            <Button type="submit" bgColor="#E94057" color="white" width="10rem" margin="4" _hover={{ bgColor: "#751B6C" }} isLoading={isLoading}>
              Upload
            </Button>
          </VStack>
        </form>
        {isLoading && (
          <Flex direction="column" align="center" justify="center" mt={4}>
            <Image src={loadingGif} alt="Loading..." boxSize="150px" width="200" height="200" />
            <Text mt={2}><i>It may take a while, please wait :D</i></Text>
          </Flex>
        )}
      </Flex>

      {uploadResponse && (
        <Box mt={8} textAlign="center">
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Output File 
          </Text>
          <Image src={uploadResponse.output_file} alt="GIF" maxW="100%" mx="auto" />
          <VStack spacing={4} align="center" mt={4}>
            <Flex direction="column" align="center" justify="center">
              <FormControl id="fileName">
                <FormLabel>File Name</FormLabel>
                <Input type="text" value={selectedFile?.name || ''} readOnly />
              </FormControl>
              <FormControl id="exerciseTypeResponse">
                <FormLabel>Exercise Type</FormLabel>
                <Input type="text" value={uploadResponse.exercise_type || ''} readOnly />
              </FormControl>
              <FormControl id="repsCount">
                <FormLabel>Reps Count</FormLabel>
                <Input type="text" value={uploadResponse.reps_count || ''} readOnly />
              </FormControl>
              <FormControl id="outputFile">
                <FormLabel>Output File</FormLabel>
                <Input type="text" value={uploadResponse.output_file || ''} readOnly />
              </FormControl>
            </Flex>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default UploadVideo;
