import React, { useState } from "react";
import { Box, Radio, RadioGroup, Stack, Text, Button } from "@chakra-ui/react";
import { getGoal } from "../localstorage/user";
import { ColorButtomGray, ColorButtomPink } from "../utils/_Palette";
const LikertScaleSurvey = ({ responses, setResponses, handleSubmit }) => {
  const goal = getGoal();
  // 질문 데이터
  const questions = [
    {
      id: "question1",
      text: "이번에 작성한 일기를 통해 오늘 하루 동안의 감정을 더 잘 이해할 수 있었나요?",
      options: [
        "전혀 도움이 되지 않았어요",
        "조금 도움이 되었어요",
        "보통 정도로 도움이 되었어요",
        "꽤 도움이 되었어요",
        "아주 많이 도움이 되었어요",
      ],
    },
    {
      id: "question2",
      text: "일기를 쓰면서 부정적인 감정을 지나치게 떠올려서 불편함을 느낀 적이 있었나요?",
      options: [
        "전혀 그렇지 않았어요",
        "조금 그런 느낌이 있었어요",
        "보통 정도로 느꼈어요",
        "꽤 그런 느낌이 있었어요",
        "아주 많이 불편했어요",
      ],
    },
    {
      id: "question3",
      text: `오늘 하루 동안  ${goal} 을(를) 얼마나 자주 떠올렸나요?`,
      options: [
        "전혀 떠올리지 못했어요",
        "가끔 떠올렸어요",
        "보통 정도로 떠올렸어요",
        "자주 떠올렸어요",
        "계속 떠올렸어요",
      ],
    },
    {
      id: "question4",
      text: `오늘 하루 동안  ${goal}을(를) 얼마나 실천했다고 생각하나요?`,
      options: [
        "전혀 실천하지 않았어요",
        "조금 실천했어요",
        "보통 정도로 실천했어요",
        "꽤 실천했어요",
        "아주 적극적으로 실천했어요",
      ],
    },
    {
      id: "question5",
      text: `내가 설정한 ${goal}은(는) 내게 매우 중요하다고 느껴지나요?`,
      options: [
        "전혀 그렇지 않아요",
        "조금 그렇다고 느껴요",
        "보통 정도로 중요하다고 생각해요",
        "꽤 중요하다고 느껴요",
        "매우 중요하다고 느껴요",
      ],
    },
  ];

  // 답변 업데이트 함수
  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  return (
    <Box padding="20px" maxWidth="600px" margin="auto">
      <Text fontSize="2xl" fontWeight="bold" marginBottom="20px">
        오늘의 일기 평가
      </Text>
      {questions.map((question) => (
        <Box key={question.id} marginBottom="20px">
          <Text fontSize="lg" marginBottom="10px">
            {question.text}
          </Text>
          <RadioGroup
            onChange={(value) => handleResponseChange(question.id, value)}
            value={responses[question.id]}
          >
            <Stack spacing={3}>
              {question.options.map((option, index) => (
                <Radio key={index} value={String(index + 1)}>
                  {index + 1}: {option}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </Box>
      ))}
      <Button
        backgroundColor={ColorButtomPink}
        textColor={"white"}
        w="100%"
        justifyContent="center"
        alignItems="center"
        onClick={handleSubmit}
        isDisabled={Object.values(responses).some(
          (response) => response === ""
        )}
      >
        오늘 하루 저장하기
      </Button>
    </Box>
  );
};

export default LikertScaleSurvey;
