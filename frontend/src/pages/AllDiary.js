import { Flex, Spinner, Text } from "@chakra-ui/react";
import { getUserJournals } from "../api/user";
import React, { useEffect, useState } from "react";

const AllDiary = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // 사용자 일기 목록 가져오기
  const fetchJournals = async () => {
    try {
      const userJournals = await getUserJournals("user");
      setJournals(userJournals);
    } catch (error) {
      alert("일기를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false); // 로딩 상태를 완료로 변경
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  if (loading) {
    // 로딩 중일 때 표시할 내용
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" /> {/* Chakra UI Spinner */}
        <Text ml={4}>로딩 중...</Text>
      </Flex>
    );
  }

  return (
    <>
      <Flex flexDirection="column" p={4}>
        {journals.length > 0 ? (
          journals.map((journal, index) => (
            <Flex
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              mb={4}
              flexDirection="column"
            >
              <Text fontWeight="bold">내용:</Text>
              <Text>{journal.content}</Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                작성일: {journal.date}
              </Text>
            </Flex>
          ))
        ) : (
          <Text>저장된 일기가 없습니다.</Text>
        )}
      </Flex>
    </>
  );
};

export default AllDiary;
