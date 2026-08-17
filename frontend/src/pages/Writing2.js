import { Flex, Text, Image, Textarea, Button, Box } from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import { ColorButtomGray, ColorButtomPink } from "../utils/_Palette";
import LikertScaleSurvey from "./LikertScaleSurvey";
import { getUserId } from "../localstorage/user";
import { saveJournal } from "../api/user";
import WriteIntroduceView from "../component/Write/WriteIntroduceVies";
import MessageBox from "../component/Write/MessageBox";
import DiaryView from "../component/Write/DiaryView";
import { useNavigate } from "react-router-dom";
import LoadingDots from "./LoadingDots";

const Write2 = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [responses, setResponses] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });
  const [textInput, setTextInput] = useState(""); // User input
  const [summary, setSummary] = useState(""); // Summary state
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const handleSubmit = () => {
    save();
  };

  const save = async () => {
    const body = {
      userId: getUserId(),
      content: summary, // Use the summary for the content
      question1: responses.question1,
      question2: responses.question2,
      question3: responses.question3,
      question4: responses.question4,
      question5: responses.question5,
    };
    try {
      await saveJournal(body);
      alert("오늘의 일기 작성 완료");
      navigate("/list");
    } catch (err) {
      console.log(err);
    }
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "안녕하세요! 오늘 하루는 어땠나요?",
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState(
    "안녕하세요! 오늘 하루는 어땠나요?"
  );
  const sendConversationToBackend = async () => {
    if (!textInput) return;

    setIsLoading(true); // 로딩 상태 시작

    try {
      const response = await fetch(
        `https://expressive-journal-ffd3bd7ddefd.herokuapp.com/standalone/${getUserId()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: [...messages, { role: "user", content: textInput }],
            user: getUserId(),
            num: "1",
            turn: messages.length + 1,
            module: "Wrapping up",
            model: "gpt-4",
          }),
        }
      );
      const data = await response.json();

      if (data && data.options && data.options.length > 0) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "user", content: textInput },
          { role: "assistant", content: data.options[0] },
        ]);
        setCurrentMessage(data.options[0]);
        setTextInput("");

        if (data && data.summary) {
          setSummary(data.summary); // Update summary with standalone response
        }

        if (messages.length >= 2) {
          sendConversationToDiary(); // Trigger diary summary request
        }
      } else {
        console.error("잘못된 응답: options 필드 없음");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  // Function to send conversation summary to the diary endpoint
  const sendConversationToDiary = async () => {
    try {
      const response = await fetch(
        `https://expressive-journal-ffd3bd7ddefd.herokuapp.com/chat/diary/${getUserId()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: messages,
            user: getUserId(),
            session: "1",
          }),
        }
      );

      const data = await response.json();
      if (data && data.summary) {
        setSummary(data.summary); // Update the summary state
        console.log("Diary Summary: ", data.summary);
      } else {
        console.error("잘못된 응답: summary 필드 없음");
      }
    } catch (error) {
      console.error("Error sending message to diary backend:", error);
    }
  };

  return (
    <>
      {step === 1 ? (
        <Flex flexDir={"column"} mx="16px" flex={1} overflowX="scroll">
          <WriteIntroduceView />
          <MessageBox messages={messages} />
          <Flex flexDir={"column"}>
            <Flex mt={"10px"} align={"center"}>
              <Image
                src="/image/doctor.png"
                w="43px"
                h="40px"
                justifyContent={"center"}
                mr="12px"
                mb="12px"
              />
              {isLoading ? (
                <LoadingDots />
              ) : (
                <Text fontWeight={700} fontSize={"14px"}>
                  {currentMessage}
                </Text>
              )}
            </Flex>
            <Flex mb={"10px"}>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                height={"222px"}
                placeholder="Feel free to write about anything recent in a comfortable and open way. :)"
                textStyle={"md"}
                maxLength={1000}
                variant="unstyled"
                _placeholder={{
                  color: "#b8bcc8",
                  fontWeight: "400",
                  fontSize: "12px",
                }}
              />
            </Flex>
          </Flex>

          <Text fontWeight={700} fontSize={"12px"} mt={4}>
            📖 After 3 turns, the diary will be automatically created.
          </Text>
          <Flex width={"100%"}>
            <Button
              backgroundColor={ColorButtomPink}
              textColor={"white"}
              w="100%"
              justifyContent="center"
              alignItems="center"
              onClick={() => {
                if (textInput.length < 10) {
                  alert(
                    "Your entry is a bit short. How about adding a bit more?"
                  );
                } else {
                  sendConversationToBackend();
                }
              }}
            >
              💬 대답하기
            </Button>
          </Flex>
          {summary !== "" && (
            <>
              <DiaryView diary={summary} saveDiary={() => setStep(2)} />
            </>
          )}
        </Flex>
      ) : (
        <LikertScaleSurvey
          responses={responses}
          setResponses={setResponses}
          handleSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default Write2;
