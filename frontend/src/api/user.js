import axios from "axios";

// Axios 기본 설정
const axiosInstance = axios.create({
  baseURL: "https://expressive-journal-ffd3bd7ddefd.herokuapp.com", // 공통 API URL
  headers: { "Content-Type": "application/json" },
});

// 회원가입 API 호출 함수
export const signup = async ({ email, password, goal }) => {
  try {
    const response = await axiosInstance.post("/signup", {
      email,
      password,
      goal,
    });
    return response.data; // 성공 응답 데이터 반환
  } catch (err) {
    throw err; // 에러는 호출한 함수에서 처리하도록 전달
  }
};

export const saveJournal = async ({
  userId,
  content,
  question1,
  question2,
  question3,
  question4,
  question5,
}) => {
  try {
    // 데이터를 JSON 형식으로 전달
    const response = await axiosInstance.post("/journals", {
      userId,
      content,
      question1,
      question2,
      question3,
      question4,
      question5,
    });
    return response.data; // { message, doc_id }
  } catch (error) {
    console.error("Error saving journal:", error);
    throw error; // 에러는 호출한 쪽에서 처리
  }
};

/**
 * 특정 사용자의 일기 목록을 가져오는 API
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Array>} - 일기 목록
 */
export const getUserJournals = async (userId) => {
  try {
    const response = await axiosInstance.get(`/journals/${userId}`);
    return response.data; // [{ userId, content, rating, date, created_at }]
  } catch (error) {
    console.error("Error fetching user journals:", error);
    throw error; // 에러는 호출한 쪽에서 처리
  }
};
export const login = async ({ email, password }) => {
  try {
    const response = await axiosInstance.post("/login", {
      email,
      password,
    });
    return response.data; // 성공 응답 데이터 반환
  } catch (err) {
    throw err; // 에러는 호출한 함수에서 처리하도록 전달
  }
};
