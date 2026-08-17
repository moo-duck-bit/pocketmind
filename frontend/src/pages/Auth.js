import { login } from "../api/user";

import { useNavigate } from "react-router-dom";
import { Flex, Text, Box, Input, Button } from "@chakra-ui/react";

import { React, useState } from "react";
import { ColorSigniture } from "../utils/_Palette";
import { setGoal, setUserId } from "../localstorage/user";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const signInWithEmailPassword = async () => {
    try {
      const data = await login({ email, password });
      setUserId(data.user_id);
      setGoal(data.goal);
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Error: 가입된 정보가 없습니다");
    }
  };

  const goToSignUp = () => {
    navigate("/signup");
  };

  return (
    <Box minH={"calc(100vh - 130px)"} alignContent="center" mx="12px">
      <Flex
        flexDir={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        mt="-100px"
      >
        <Text fontSize={"20px"} fontWeight={400} mb="0px">
          나만의 일기로 상담사를 만나요 🙂
        </Text>
        <Text fontSize={"32px"} fontWeight={700}>
          로그인 하기
        </Text>
        <Input
          placeholder="✉️ Please enter your email address"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          mb="12px"
        />
        <Input
          placeholder="🔑 Please enter your password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          mb="30px"
        />
        <Button
          backgroundColor={ColorSigniture}
          color={"white"}
          width={"100%"}
          borderRadius={"20px"}
          onClick={signInWithEmailPassword}
        >
          로그인 하기
        </Button>
        <Button
          width={"100%"}
          onClick={goToSignUp}
          mt="10px"
          borderRadius={"20px"}
        >
          회원가입
        </Button>
      </Flex>
      <Text mt="12px">로그인에 문제가 있나요?</Text>
    </Box>
  );
};
export default Auth;
