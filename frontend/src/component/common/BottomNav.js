import { Box, Flex, Image, Text } from "@chakra-ui/react";
import React from "react";
import { useState, useEffect } from "react";
import { TabMenu1, TabMenu2, TabMenu3, TabMenu4 } from "../../utils/_Text";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";
import Cookies from "universal-cookie";
const cookies = new Cookies();
const BottomNav = ({ number }) => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));

  const signUserOut = async () => {
    localStorage.clear();
    navigate("/");
  };
  function navigateToWriting(pathname) {
    navigate(pathname);
  }
  return (
    <Flex
      position="sticky"
      as="nav"
      w="100%"
      height="70px"
      alignItems="center"
      zIndex={999}
      transition="all 0.3s"
      background="#FFFFFF"
      boxShadow="0px -10px 10px rgba(0, 0, 0, 0.02)"
      bottom="0"
    >
      {
        //아이콘 클릭시 on/off 및 경로 변경
      }
      <Flex
        justifyContent="space-between"
        pl="10px"
        pr="10px"
        w="100%"
        alignItems="center"
        mt="20px"
      >
        <Flex
          w="20%"
          justifyContent="center"
          alignItems="center"
          flexDir={"column"}
        >
          <Image
            src={number === 1 ? "/image/diary.png" : "/image/diary.png"}
            w="28px"
            h="28px"
            onClick={() => {
              navigateToWriting("/");
            }}
          />
          <Text fontSize={"12px"} fontWeight={500}>
            {TabMenu1}
          </Text>
        </Flex>
        <Flex
          w="20%"
          justifyContent="center"
          alignItems="center"
          flexDir={"column"}
        >
          <Image
            src={number === 3 ? "/image/diary.png" : "/image/diary.png"}
            w="28px"
            h="28px"
            onClick={() => {
              navigateToWriting("/writing");
            }}
          />
          <Text fontSize={"12px"} fontWeight={500}>
            {TabMenu2}
          </Text>
        </Flex>
        <Flex
          w="20%"
          justifyContent="center"
          alignItems="center"
          flexDir={"column"}
        >
          <Image
            src={number === 3 ? "/image/diary.png" : "/image/diary.png"}
            w="28px"
            h="28px"
            onClick={() => {
              navigateToWriting("/list");
            }}
          />
          <Text fontSize={"12px"} fontWeight={500}>
            {TabMenu3}
          </Text>
        </Flex>
        <Flex
          w="20%"
          justifyContent="center"
          alignItems="center"
          flexDir={"column"}
        >
          <Image
            src={number === 3 ? "/image/diary.png" : "/image/diary.png"}
            w="28px"
            h="28px"
            onClick={() => {
              signUserOut();
            }}
          />
          <Text fontSize={"12px"} fontWeight={500}>
            {TabMenu4}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default BottomNav;
