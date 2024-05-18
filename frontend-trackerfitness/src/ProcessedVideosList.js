import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Link } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

const ProcessedVideosList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/list_files/');
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <Box
      p={4}
      height="100vh"
      bgGradient="linear(to-b, #0f0c29, #302b63)"
      color="white"
    >
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Button
          as={NavLink}
          to="/"
          bgColor="#E94057"
          color="white"
          width="10rem"
          margin="4"
          _hover={{ bgColor: "#751B6C" }}
        >
          Home
        </Button>
      </Box>
      <Heading as="h1" size="xl" mb={4} color="white">
        Processed Videos List
      </Heading>
      <Table variant="simple" colorScheme="whiteAlpha">
        <Thead>
          <Tr>
            <Th color="white">Nomor</Th>
            <Th color="white">Nama file</Th>
          </Tr>
        </Thead>
        <Tbody>
          {videos.map((video, index) => (
            <Tr key={index}>
              <Td>{index + 1}</Td>
              <Td>
                <Link href={video.url} target="_blank" rel="noopener noreferrer" color="white.200">
                  {video.name}
                </Link>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ProcessedVideosList;
