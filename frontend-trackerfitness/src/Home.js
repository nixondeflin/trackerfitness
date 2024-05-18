import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Text, Flex, Box } from '@chakra-ui/react';
import backgroundImage from './assets/bgweb.png'; // Adjust the path if necessary

const Home = () => {
  return (
    <Box
      height="100vh"
      backgroundImage={`url(${backgroundImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
      color="white"
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        height="100vh"
      >
        <Flex justify="space-between" align="center" width="80%">
          <Box textAlign="left">
            <Text
              bgGradient="linear(to-l, #8A2387, #E94057, #F27121)"
              bgClip="text"
              fontSize="6xl"
              fontWeight="extrabold"
              mb={4}
            >
              AI Tracker Fitness Service
            </Text>
            <Text mb={8}>
              <i><b>AI Fitness Tracker</b></i> adalah sebuah <i>service</i> untuk memantau dan menganalisis aktivitas fisik pengguna, 
              <br />
              Dengan menggunggah data video, <i>AI Fitness Tracker</i> dapat memberikan analisis jumlah repetisi yang pengguna lakukan untuk membantu mencapai tujuan kebugaran mereka. Pengguna juga dapat melihat lagi hasil video mereka di <i>Processed Video</i>.
            </Text>
          </Box>
          <Box>
            <Button bgColor="#E94057" color="white" width="10rem" margin="4" _hover={{ bgColor: "#751B6C" }}>
              <NavLink to="/uploadvideo" exact="true" activeClassName="active">
                Upload Video
              </NavLink>
            </Button>
            <Button bgColor="#E94057" color="white" width="12rem" margin="4" _hover={{ bgColor: "#751B6C" }}>
              <NavLink to="/processed-videos" activeClassName="active">
                Processed Videos
              </NavLink>
            </Button>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Home;
