import React, { useState } from "react";
import { Textarea, Flex, Text, Box, Input, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/user";
import { ColorSigniture } from "../utils/_Palette";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const navigate = useNavigate();

  const SignupEmail = async () => {
    try {
      // authAPI.js에 정의된 signup 함수 호출
      await signup({ email, password, goal });
      console.log("회원가입 성공!");
      navigate("/");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage.includes("wrong-password")) {
        alert(
          "비밀번호가 틀렸습니다. 비밀번호가 기억나지 않으신다면, haillydev@gmail.com으로 연락주세요"
        );
      } else if (errorMessage.includes("user-not-found")) {
        alert("계정정보가 없습니다.");
      } else if (errorMessage.includes("invalid-email")) {
        alert("올바른 이메일 형식이 아닙니다.");
      } else {
        alert("Error: " + errorMessage);
      }
    }
  };

  const onClickNext = () => {
    if (password !== password2) {
      alert("비밀번호가 서로 다릅니다.");
      return;
    }
    setStep(2);
  };

  return (
    <Box mx="12px" mt="20px">
      <Flex flexDir={"column"}>
        <Text fontSize={"20px"} fontWeight={400} mb="0px">
          나만의 일기로 상담사를 만나요 🙂
        </Text>
        <Text fontSize={"32px"} fontWeight={700}>
          회원가입
        </Text>
        {step === 1 ? (
          <>
            <Text fontSize={"15px"} fontWeight={700} mt="15px">
              이메일
            </Text>
            <Input
              placeholder="✉️ Please enter your email address"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              mb="12px"
            />
            <Text fontSize={"15px"} fontWeight={700} mt="15px">
              비밀번호
            </Text>
            <Input
              placeholder="🔑 Please enter your password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              mb="30px"
            />
            <Text fontSize={"15px"} fontWeight={700} mt="15px">
              비밀번호 확인
            </Text>
            <Input
              placeholder="🔑 Please enter your password"
              type="password"
              onChange={(e) => setPassword2(e.target.value)}
              mb="30px"
            />
            <Button
              backgroundColor={ColorSigniture}
              color={"white"}
              width={"100%"}
              borderRadius={"20px"}
              onClick={() => onClickNext()}
            >
              다음으로
            </Button>
          </>
        ) : (
          <>
            <Text fontSize={"15px"} fontWeight={700} mt="15px">
              마지막으로 본인이 일기쓰기를 할동안 변화하고 싶은 일상의 정신건강
              목표를 입력해주세요.
            </Text>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              height={"222px"}
              placeholder=" :)"
              textStyle={"md"}
              maxLength={1000}
              variant="unstyled"
              _placeholder={{
                color: "#b8bcc8",
                fontWeight: "400",
                fontSize: "12px",
              }}
            />
            <Text fontSize={"15px"} fontWeight={700} mt="15px">
              ( 00 하기의 양식으로 작성해주세요, ex: 덜 불안해하기, 자책하지
              말기, 우울감을 감소시키기)
            </Text>
            <Button
              width={"100%"}
              onClick={SignupEmail}
              mt="10px"
              borderRadius={"20px"}
            >
              회원가입
            </Button>
          </>
        )}
      </Flex>
      <Text mt="12px">로그인에 문제가 있나요?</Text>
    </Box>
  );
};
export default Signup;
