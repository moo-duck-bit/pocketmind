import { Box, Flex, Text, Image, Stack } from "@chakra-ui/react";
import React from 'react';
import {useNavigate} from "react-router-dom";
const TopNav = () => {
  const navigate = useNavigate();

  return (
    <Flex bg="#F1F8F4" height="80px" align="center" alignItems="center" width={'100%'} onClick={()=>navigate('/')} boxShadow="0px 2px 8px rgba(62, 141, 86, 0.08)">
    <Flex alignItems="center"  px={4}>
      {/* 로고 이미지 */}
      <Image
        src="/image/logo.png" // 여기에 실제 이미지 경로를 입력하세요.
        alt="Pocket Mind-Bot Logo"
        w="45px"
        h="45px"
        mr={4} 
      />
      
      {/* 텍스트 스택 */}
      <Flex align="center" alignItems="center">

        <Text fontSize="xl" fontWeight="bold" color="black" mr='5px'>
          Pocket
        </Text>
        <Text fontSize="xl" fontWeight="bold" color="#3E8D56">
          Mind-bot
        </Text>
      </Flex>
    </Flex>
  </Flex>
  
  );
};

export default TopNav;
