import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button, Box, Text, Flex } from "@chakra-ui/react";
import DiaryChart from "./Chart";
import { getUserJournals } from "../api/user";
import { getUserId } from "../localstorage/user";
import { useNavigate } from "react-router-dom";

const DiaryMock = () => {
  const [mockDates, setMockDates] = useState([]); // 작성된 날짜 배열
  const [journals, setJournals] = useState([]);
  const [mockRatings, setMockRatings] = useState({}); // 날짜별 척도
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [menu, setMenu] = useState(1);

  const Navigate = useNavigate();

  // API에서 데이터 가져오기
  const fetchJournals = async () => {
    try {
      const userJournals = await getUserJournals(getUserId());
      setJournals(userJournals);

      // 일기 작성 날짜만 추출
      const dates = userJournals.map((journal) => journal.date.slice(0, 10));

      setMockDates(dates);

      // 날짜와 척도를 매핑해서 객체 생성
      const ratings = {};
      userJournals.forEach((journal) => {
        ratings[journal.date] = journal.question3;
      });

      setMockRatings(ratings);
    } catch (error) {
      console.error("일기를 불러오는 중 오류가 발생했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals(); // 컴포넌트 로드 시 데이터 가져오기
  }, []);

  // 캘린더의 특정 날짜에 스타일 적용
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD 형식으로 변환
      if (mockDates.includes(dateString)) {
        return "highlight-circle"; // 해당 날짜에 스타일 적용
      }
    }
    return ""; // 기본 스타일
  };

  // 차트 데이터 준비
  const chartData = {
    labels: mockDates, // 날짜
    datasets: [
      {
        label: "일기 척도 (0~10)",
        data: Object.values(mockRatings), // 척도 값
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      {loading ? (
        <p>데이터를 불러오는 중입니다...</p>
      ) : (
        <>
          {menu === 1 ? (
            <>
              <Calendar
                tileClassName={tileClassName} // 특정 날짜에 스타일 추가
                view="month" // 월 단위 보기
                defaultValue={new Date()} // 현재 날짜로 초기화
                minDetail="month" // 연, 월 상세만 보여줌
              />
              <DiaryChart chartData={chartData} />
              <Button
                backgroundColor="#3E8D56"
                color={"white"}
                width="100%"
                mt={4}
                borderRadius="10px"
                _hover={{ backgroundColor: "#2E7546" }}
                onClick={() => setMenu(2)}
              >
                내 일기 모두 보기
              </Button>
            </>
          ) : (
            <>
              <Flex flexDirection="column" gap={4}>
                {journals.map((journal, index) => (
                  <Box
                    key={index}
                    border="1px solid #e2e8f0"
                    borderRadius="md"
                    padding="16px"
                    boxShadow="md"
                    bg="white"
                  >
                    <Text fontWeight="bold" fontSize="lg" mb={2}>
                      {journal.date}
                    </Text>
                    <Text fontSize="md" mb={2}>
                      {journal.content}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Q1: {journal.question1}, Q2: {journal.question2}, Q3:{" "}
                      {journal.question3}, Q4: {journal.question4}, Q5:{" "}
                      {journal.question5}
                    </Text>
                  </Box>
                ))}
              </Flex>
              <Button
                backgroundColor="#3E8D56"
                color="white"
                width="100%"
                mt={4}
                borderRadius="10px"
                _hover={{ backgroundColor: "#2E7546" }}
                onClick={() => setMenu(1)}
              >
                돌아가기
              </Button>
            </>
          )}
        </>
      )}
      <style>
        {`
          .highlight-circle {
            background-color: #3E8D56 !important; /* 녹색 배경 */
            color: white !important; /* 흰색 텍스트 */
            border-radius: 50%; /* 동그라미 모양 */
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .react-calendar__tile--now {
            background-color: #66BB6A !important; /* 오늘 날짜 밝은 녹색 */
            border-radius: 50%;
          }
          .react-calendar__tile--active {
            background-color: #3E8D56 !important; /* 선택된 날짜 */
            color: white !important;
          }
          .react-calendar__tile {
            height: 50px; /* 타일 높이 */
            width: 50px; /* 타일 너비 */
          }
        `}
      </style>
    </div>
  );
};

export default DiaryMock;
