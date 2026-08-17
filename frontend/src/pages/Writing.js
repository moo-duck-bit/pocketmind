import { useEffect, useState, useRef, React, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  getCountFromServer,
  updateDoc,
  arrayUnion,
  increment,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { app, db, messaging } from "../firebase-config";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import Card from "react-bootstrap/Card";

import { Flex, Text, Button, Box } from "@chakra-ui/react";
import Toast from "react-bootstrap/Toast";
import { BeatLoader, HashLoader } from "react-spinners";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { ToastContainer } from "react-bootstrap";
import Likert from "react-likert-scale";
import { getToken } from "firebase/messaging";
import book_blue from "../img/book_blue.jpg";
import book_purple from "../img/book_purple.jpg";
import chat from "../img/chat.jpg";
import lock from "../img/lock.jpg";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Authentication 추가
import Userinput from "../component/Write/UserInput";
import ChatBox from "../component/Write/ChatBox";
import DiaryView from "../component/Write/DiaryView";
import { ColorSigniture } from "../utils/_Palette";
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

function Writing(props) {
  const [show, setShow] = useState(false);
  let [loading, setLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(false);
  const receivedText = useRef("");
  const receivedDiary = useRef("");
  const turnCount = useRef(null);
  const sessionInputRef = useRef(null);
  const [session, setSession] = useState("");
  let [inputUser, setInputUser] = useState("");
  let [prompt, setPrompt] = useState("");
  let [module, setModule] = useState("");
  let [diary, setDiary] = useState("");
  let [existing, setExisting] = useState([{ sessionStart: "데이터 불러오기" }]);
  const updateProgress = useRef(true);
  let [surveyReady, setSurveyReady] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [userType, setUserType] = useState("patient");
  const [userMail, setUserMail] = useState(null);
  const [user, setUser] = useState(null);
  const diaryRequest = useRef(false);

  const [modalShow, setModalShow] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState("");
  const notSpoken = useRef(true);
  const navigate = useNavigate();
  const current = new Date();
  const date = `${current.getFullYear()}year ${current.getMonth() + 1}month ${current.getDate()}day`;

  const phq1 = useRef(null);
  const phq2 = useRef(null);
  const phq3 = useRef(null);
  const phq4 = useRef(null);
  const phq5 = useRef(null);
  const phq6 = useRef(null);
  const phq7 = useRef(null);
  const phq8 = useRef(null);
  const phq9 = useRef(null);
  let [phqTotal, setPhqTotal] = useState(null);

  const [counselorDiagnosis, setCounselorDiagnosis] = useState(""); // 상담사 모델 진단 상태
  const [doctorDiagnosis, setDoctorDiagnosis] = useState(""); // 의사 모델 진단 상태
  const [pocketMindDiagnosis, setPocketMindDiagnosis] = useState(""); // Pocket-mind 진단 상태
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false); // 모달 열기/닫기 상태

  // 모달 열기/닫기 함수
  const handleShowDiagnosisModal = () => setShowDiagnosisModal(true);
  const handleCloseDiagnosisModal = () => {
    setShowDiagnosisModal(false);
    // 모달을 닫을 때 화면 전환을 처리
    navigateToReview(); // 모달이 닫힌 후에 화면 이동
  };

  const auth = getAuth(); // Firebase 인증 객체

  // 사용자 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // 사용자가 로그인되어 있을 때 상태 저장
        console.log("User logged in:", user.email);
      } else {
        console.log("No user is logged in.");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // const [counselorResponse, setCounselorResponse] = useState(''); // 상담사 답변 기록
  // const [doctorResponse, setDoctorResponse] = useState(''); // 의사 답변 기록
  // const [pocketMindResponse, setPocketMindResponse] = useState(''); // Pocket-mind 답변 기록

  // voice input feature
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "Web Speech API is not supported in this browser. Please use Google Chrome."
      );
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = "ko";
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setTextInput(textInput + " " + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start({ continuous: true });
    } else {
      recognition.stop({ continuous: true });
    }

    return () => {
      recognition.abort();
    };
  }, [isListening]);

  // monitoring firebase data
  useEffect(() => {
    async function renewList() {
      const existingSession = await receiveSessionData();
      setExisting(existingSession);
      updateProgress.current = false;
      console.log(existing);
    }

    if (sessionStatus === false && updateProgress.current === true) {
      renewList();
    } else if (sessionStatus && session !== "") {
      const diaryDocRef = doc(db, "session", props.userMail, "diary", session);
      const unsubscribe = onSnapshot(diaryDocRef, (doc) => {
        const data = doc.data();
        // Tracking "outputFromLM" field
        if (data) {
          console.log("새로고침");
          receivedText.current = data["outputFromLM"];
          getLastSentence(receivedText.current);
          receivedDiary.current = data["diary"];
          if (receivedDiary.current !== "") {
            if (receivedDiary.current !== diary) {
              setShow(true);
              console.log("새로고침_다이어리");
              setDiary(receivedDiary.current);
            }
          }
          turnCount.current = data["turn"];
        }
      });
      return () => {
        unsubscribe();
      };
    }
  });
  // 사용자 유형을 Firestore에서 확인하여 의사 또는 환자 구분
  useEffect(() => {
    async function fetchUserType() {
      try {
        console.log("Fetching user type for:", props.userMail); // 디버깅 로그 추가
        console.log("Fetching user type for:", props.userType); // 디버깅 로그 추가
        // 의사 컬렉션에서 해당 이메일 문서를 조회
        const userDocRef = doc(db, "doctor", props.userMail);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserType("doctor");
          console.log("의사 계정입니다. 이메일: ", props.userMail);
          console.log("Fetching user type for:", props.userType); // 디버깅 로그 추가
        } else {
          // 환자일 가능성이 있으므로 환자 컬렉션에서도 확인
          setUserType("patient");
          console.log("환자 계정입니다. 이메일: ", props.userMail);
          console.log("Fetching user type for:", props.userType); // 디버깅 로그 추가
        }
      } catch (error) {
        console.error("사용자 유형을 가져오는 중 오류 발생:", error);
        setUserType("patient");
      }
    }

    fetchUserType();
  }, [props.userMail, props.userType]);

  useEffect(() => {
    if (userType) {
      console.log("새로고침 user type :", userType); // 여기에서 userType을 참조
    }
  }, [userType]);

  useEffect(() => {
    // userType이 설정된 후에 FCM 토큰 처리
    console.log("userType 상태 확인:", userType); // userType 상태 확인용 로그 추가
    if (userType) {
      console.log("FCM 토큰 처리 시작", userType); // 조건 진입 여부 디버깅 로그 추가
      handleFCMToken(props.userMail, userType);
    } else {
      console.log("userType이 아직 설정되지 않음"); // userType이 설정되지 않은 경우 로그 추가
    }
  }, [userType]); // userType이 변경될 때마다 실행

  // 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환하는 함수
  function getTodayDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더해줌
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // "YYYY-MM-DD" 형식으로 날짜 반환
  }
  // 병렬로 진단 결과를 저장하는 함수
  async function saveDiagnosisToFirestore(
    counselorDiagnosis,
    doctorDiagnosis,
    pocketMindDiagnosis,
    userMail
  ) {
    try {
      // 오늘 날짜로 컬렉션 이름 생성
      const todayDate = getTodayDate();

      await setDoc(
        doc(db, "diagnosis", props.userMail, "dates", todayDate),
        {
          counselorDiagnosis: counselorDiagnosis || "진단 결과 없음",
          doctorDiagnosis: doctorDiagnosis || "진단 결과 없음",
          pocketMindDiagnosis: pocketMindDiagnosis || "진단 결과 없음",
          date: todayDate, // 저장 날짜 추가
          userMail: props.userMail, // 사용자 이메일 추가
        },
        { merge: true }
      );

      console.log("Firestore에 진단 결과 저장 완료:", userMail, todayDate);
    } catch (error) {
      console.error("Firestore에 진단 결과 저장 중 오류 발생:", error);
    }
  }

  // FCM 토큰을 생성하고, 백엔드에 전송하는 함수
  async function handleFCMToken(userEmail, userType) {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("FCM 토큰 요청 중...");
        console.log("라이팅-메시징");
        console.log(messaging);

        messaging
          .deleteToken()
          .then(() => {
            return messaging.getToken();
          })
          .then((newToken) => {
            console.log("New FCM Token:", newToken);
            // 백엔드에 새로운 토큰을 저장
          })
          .catch((err) => {
            console.error("Unable to retrieve refreshed token: ", err);
          });

        getToken(messaging, {
          vapidKey:
            "BHxLI9MyVyff7V0GVCp4n6sxF3LwarXbJHHbx1wO2SSil7bgJMy0AiYhONPMrMFpYZ2G6FyDO_AYmHqs-sDJ4p0",
        })
          .then((currentToken) => {
            if (currentToken) {
              // Send the token to your backend server
              fetch(
                "https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/fcm/register-fcm-token",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: userEmail,
                    userType: userType, // 'doctor' 또는 'patient'
                    fcmToken: currentToken,
                  }),
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    console.error(
                      "Error registering FCM token:",
                      response.statusText
                    );
                  } else {
                    console.log("FCM token successfully sent to backend");
                  }
                })
                .catch((err) => {
                  console.error("Error sending FCM token to backend:", err);
                });
            } else {
              console.log(
                "No registration token available. Request permission to generate one."
              );
            }
          })
          .catch((err) => {
            console.error("An error occurred while retrieving token: ", err);
          });
      } else if (permission === "denied") {
        alert(
          "Web push 권한이 차단되었습니다. 알림을 사용하시려면 권한을 허용해주세요."
        );
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        );
      }
    } catch (error) {
      console.error("Error handling FCM token:", error);
    }
  }

  async function receiveSessionData() {
    let tempArr = [];
    const userDocRef = doc(db, "session", props.userMail);
    const diaryCompleteCollRef = collection(userDocRef, "diary");
    const q = query(
      diaryCompleteCollRef,
      where("isFinished", "==", false),
      orderBy("sessionStart", "desc")
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      tempArr.push(doc.data());
    });
    let resultArr = tempArr.slice(0, 4);
    return resultArr;
  }

  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  const isEvening = true;
  // const isEvening = currentHour >= 10 && currentHour < 24;

  // create NewDoc
  async function createNewDoc(newSession) {
    if (session !== "") {
      const docRef = doc(db, "session", props.userMail, "diary", session);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const message = docSnap.data().outputFromLM;
        console.log("진행중인 세션이 있습니다");
        if (message.length === 0) {
          assemblePrompt();
        } else {
          console.log("기존에 언어모델 문장 존재");
          setSessionStatus(true);
          setLoading(true);
        }
      } else {
        const myArray = [
          "만나서 반가워요, 오늘 하루 어떻게 지내셨나요?",
          "오늘 하루 어땠어요? 말하고 싶은 것이 있다면 자유롭게 이야기해주세요.",
          "안녕하세요! 오늘 하루는 어땠나요?",
          "오늘 하루도 정말 고생 많으셨어요. 어떤 일이 있었는지 얘기해주세요.",
          "오늘도 무사히 지나간 것에 감사한 마음이 드네요. 오늘 하루는 어땠나요?",
          "오늘은 어떤 새로운 것을 경험했나요? 무엇을 경험했는지 얘기해주세요.",
          "오늘은 어떤 고민이 있었나요? 저와 함께 고민을 얘기해봐요.",
        ];
        await setDoc(doc(db, "session", props.userMail, "diary", session), {
          outputFromLM: {
            options: [myArray[Math.floor(Math.random() * myArray.length)]],
            module: "Initiation",
            summary: "none",
            diary: "none",
          },
          conversation: [],
          isFinished: false,
          module: "",
          fiveOptionFromLLM: [],
          diary: "",
          topic: "",
          sessionStart: Math.floor(Date.now() / 1000),
          summary: "",
          history: [],
          turn: 0,
          sessionNumber: session,
          history_operator: [],
          reviewMode: "W",
        });
      }
      setSessionStatus(true);
      setLoading(true);
    } else {
      const docRef = doc(db, "session", props.userMail, "diary", newSession);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const message = docSnap.data().outputFromLM;
        console.log("진행중인 세션이 있습니다");
        if (message.length === 0) {
          assemblePrompt();
        } else {
          console.log("기존에 언어모델 문장 존재");
          setSessionStatus(true);
          setLoading(true);
        }
      } else {
        const myArray = [
          "만나서 반가워요, 오늘 하루 어떻게 지내셨나요?",
          "오늘 하루 어땠어요? 말하고 싶은 것이 있다면 자유롭게 이야기해주세요.",
          "안녕하세요! 오늘 하루는 어땠나요?",
          "오늘 하루도 정말 고생 많으셨어요. 어떤 일이 있었는지 얘기해주세요.",
          "오늘도 무사히 지나간 것에 감사한 마음이 드네요. 오늘 하루는 어땠나요?",
          "오늘은 어떤 새로운 것을 경험했나요? 무엇을 경험했는지 얘기해주세요.",
          "오늘은 어떤 고민이 있었나요? 저와 함께 고민을 얘기해봐요.",
        ];
        await setDoc(doc(db, "session", props.userMail, "diary", newSession), {
          outputFromLM: {
            options: [myArray[Math.floor(Math.random() * myArray.length)]],
            module: "Initiation",
            summary: "none",
            diary: "none",
          },
          conversation: [],
          isFinished: false,
          module: "",
          fiveOptionFromLLM: [],
          diary: "",
          topic: "",
          sessionStart: Math.floor(Date.now() / 1000),
          summary: "",
          history: [],
          turn: 0,
          sessionNumber: newSession,
          history_operator: [],
          reviewMode: "W",
        });
      }
      setSessionStatus(true);
      setLoading(true);
    }
  }
  async function getRelatedEmail(userMail, userType) {
    console.log("Fetching related email for:", userMail, userType);

    try {
      if (userType === "patient") {
        // 'patient' 컬렉션에서 환자의 이메일을 사용하여 문서를 가져옴
        const patientDocRef = doc(db, "patient", props.userMail);
        const patientDoc = await getDoc(patientDocRef);

        if (patientDoc.exists()) {
          // 문서가 존재할 경우 담당 의사 정보 가져오기
          const doctorEmail = patientDoc.data().doctor;
          console.log(doctorEmail[0]);
          return doctorEmail[0]; // 배열이면 첫 번째 이메일만 사용
        } else {
          console.error("해당 환자 담당, 의사 문서가 존재하지 않습니다.");
          return null;
        }
      } else if (userType === "doctor") {
        // 'doctor' 컬렉션에서 의사의 이메일을 사용하여 문서를 가져옴
        const doctorDocRef = doc(db, "doctor", props.userMail);
        const doctorDoc = await getDoc(doctorDocRef);

        if (doctorDoc.exists()) {
          // 문서가 존재할 경우 담당 환자 목록 가져오기
          const patientEmail = doctorDoc.data().patient;
          console.log(patientEmail[0]);
          return patientEmail[0]; // 환자 이메일 반환
        } else {
          console.error("해당 의사 관련, 환자의 문서가 존재하지 않습니다.");
          return null;
        }
      } else {
        console.log(userType);
        console.error(
          "올바른 userType을 전달해주세요. 'patient' 또는 'doctor'만 가능합니다."
        );
        return null;
      }
    } catch (error) {
      console.error("의사 또는 환자 정보를 가져오는 중 오류 발생:", error);
      return null;
    }
  }

  async function sendDiaryNotificationToBackend(email, diaryContent) {
    try {
      console.log("Starting to send notification to backend...");
      console.log("email:", email);
      console.log(
        "Diary content (first 20 characters):",
        diaryContent.slice(0, 20)
      );
      console.log(userType);
      const notificationTitle =
        userType === "patient"
          ? `${props.userMail} 환자 일기 알림` // 환자가 접속한 경우 담당 의사에게 보낼 제목 (환자 이메일 포함)
          : "새로운 피드백 알림"; // 의사가 접속한 경우 환자에게 보낼 제목

      const notificationBody =
        userType === "patient"
          ? `${props.userMail} 환자가 새로운 일기를 작성했습니다: ${diaryContent.slice(0, 20)}...` // 환자가 접속했으니 의사에게 보낼 메시지 (환자 이메일 포함)
          : `의사가 새로운 피드백을 남겼습니다`; // 의사가 접속했으니 환자에게 보낼 피드백 메시지

      const response = await fetch(
        "https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/fcm/send-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            title: notificationTitle,
            body: notificationBody,
            userType: userType,
          }),
        }
      );
      console.log("Fetch request sent. Waiting for response...");

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error sending notification:", errorData);
      } else {
        const result = await response.json();
        console.log("Notification sent successfully:", result);
      }
    } catch (error) {
      console.error("Error sending notification to backend:", error);
    }
  }

  async function submitDiary() {
    await setDoc(
      doc(db, "session", props.userMail, "diary", session),
      {
        sessionEnd: Math.floor(Date.now() / 1000),
        isFinished: true,
        like: 0,
        muscle: 0,
        diary: diary,
      },
      { merge: true }
    );
    // navigateToReview()
    console.log("submitDiary");
    console.log(userType);

    // Firestore에서 담당 의사, 관련 환자 정보를 가져옴
    const relatedEmail = await getRelatedEmail(props.userMail, userType);

    if (relatedEmail) {
      await sendDiaryNotificationToBackend(relatedEmail, diary); // 담당 의사의 이메일과 일기내용 전달
    } else {
      console.error("정보를 가져올 수 없습니다.");
    }

    // 진단 요청들을 병렬로 실행
    const [counselorDiagnosis, doctorDiagnosis, pocketMindDiagnosis] =
      await Promise.all([
        requestCounselorDiagnosis(diary),
        requestDoctorDiagnosis(diary),
        requestPocketMindDiagnosis(diary),
      ]);
    await saveDiagnosisToFirestore(
      counselorDiagnosis,
      doctorDiagnosis,
      pocketMindDiagnosis,
      userMail
    );

    // // 진단 결과를 Firebase에 업데이트
    // await setDoc(doc(db, "session", props.userMail, "diary", session), {
    //     counselorDiagnosis: counselorDiagnosis || '진단 결과 없음',  // 상담사 진단 결과
    //     doctorDiagnosis: doctorDiagnosis || '진단 결과 없음',        // 의사 진단 결과
    //     pocketMindDiagnosis: pocketMindDiagnosis || '진단 결과 없음' // Pocket-mind 진단 결과
    // }, {merge: true});

    setSurveyReady(true);
  }

  async function submitDiary2() {
    await setDoc(
      doc(db, "session", props.userMail, "diary", session),
      {
        sessionEnd: Math.floor(Date.now() / 1000),
        isFinished: true,
        like: 0,
        muscle: 0,
        diary: "오늘 작성한 다이어리는 숨기고 싶어요",
        diary_hidden: diary,
      },
      { merge: true }
    );
    setSurveyReady(true);
    // navigateToReview()
  }

  async function endSession() {
    await setDoc(
      doc(db, "session", props.userMail, "diary", session),
      {
        phq9score: phqTotal,
        phq_item_score: [phq1, phq2, phq3, phq4, phq5, phq6, phq7, phq8, phq9],
      },
      { merge: true }
    );
    // 진단 결과 모달을 보여줌
    handleShowDiagnosisModal();
  }

  async function editDiary(diary_edit) {
    await setDoc(
      doc(db, "session", props.userMail, "diary", session),
      {
        diary: diary_edit,
      },
      { merge: true }
    );
  }

  const toggleListening = () => {
    setIsListening((prevState) => !prevState);
  };

  // Moaal management
  function navigateToReview() {
    navigate("/list");
  }

  function handleClick() {
    setModalShow(false);
    setTimeout(() => {
      submitDiary();
    }, 500);
  }

  function handleClick2() {
    setModalShow(false);
    setTimeout(() => {
      submitDiary2();
    }, 500);
  }

  function MyVerticallyCenteredModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            마음챙김 다이어리를 종료하시겠어요?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>아래와 같이 오늘의 다이어리가 저장됩니다 📝</h5>
          <p>{diary}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClick2}>🌧️ 일기 숨기고 종료하기</Button>
          <Button onClick={handleClick}>🌤️ 일기 저장하고 종료하기</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // checking Prompt exist
  async function getLastSentence(response) {
    let a = setTimeout(() => {
      setModule(response["module"]);
      setPrompt(response["options"]?.[0]);
      if (prompt) {
        if (prompt.trim() === "") {
          setLoading(true);
        } else {
          setLoading(false);
        }
      }
    }, 10);
    return () => {
      clearTimeout(a);
    };
  }

  async function assemblePrompt() {
    const docRef3 = doc(db, "session", props.userMail, "diary", session);
    const docSnap = await getDoc(docRef3);
    if (docSnap.exists()) {
      const readyRequest = docSnap.data().conversation;
      console.log(docSnap.data());
      const turn_temp = docSnap.data().turn;
      requestPrompt(readyRequest, props.userMail, session, turn_temp, module);
      if (turn_temp > 2) {
        console.log("다이어리 요청 들어감");
        diaryInit(readyRequest, props.userMail, session);
        diaryRequest.current = true;
      }
      turnCount.current = turn_temp;
    } else {
      console.log("No such document!");
    }
  }

  // https://mindfuljournal-fzesr.run.goorm.site
  // http://0.0.0.0:8000

  function requestPrompt(text, user, num, turn, module, model) {
    return fetch(
      "https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/chat/standalone",
      {
        method: "POST",
        body: JSON.stringify({
          text: text,
          user: user,
          num: num,
          turn: turn,
          module: module,
          model: "none",
        }),
      }
    ).catch((err) => console.log(err));
  }

  async function requestCounselorDiagnosis(diary) {
    try {
      const response = await fetch(
        "https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/chat/counselor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            diary: diary,
          }),
        }
      );
      const data = await response.json();
      setCounselorDiagnosis(data.diagnosis); // 상담사 진단 결과 저장
      return data.diagnosis || "진단 결과 없음";
    } catch (error) {
      console.error("Error fetching counselor diagnosis:", error);
      setCounselorDiagnosis("진단을 가져오는 중 오류가 발생했습니다.");
    }
  }

  async function requestDoctorDiagnosis(diary) {
    try {
      const response = await fetch(
        "https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/chat/doctor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            diary: diary,
          }),
        }
      );
      const data = await response.json();
      setDoctorDiagnosis(data.diagnosis);
      return data.diagnosis || "진단 결과 없음"; // 의사 진단 결과 저장
    } catch (error) {
      console.error("Error fetching doctor diagnosis:", error);
      setDoctorDiagnosis("진단을 가져오는 중 오류가 발생했습니다.");
    }
  }

  async function requestPocketMindDiagnosis(diary) {
    try {
      const response = await fetch(
        "https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/chat/pocket",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            diary: diary,
            userMail: props.userMail,
          }),
        }
      );
      const data = await response.json();
      setPocketMindDiagnosis(data.diagnosis); // Pocket-mind 진단 결과 저장
      return data.diagnosis || "진단 결과 없음";
    } catch (error) {
      console.error("Error fetching Pocket-mind diagnosis:", error);
      setPocketMindDiagnosis("진단을 가져오는 중 오류가 발생했습니다.");
    }
  }

  function Unix_timestamp(t) {
    var date = new Date(t * 1000);
    var year = date.getFullYear();
    var month = "0" + (date.getMonth() + 1);
    var day = "0" + date.getDate();
    var hour = "0" + date.getHours();
    var minute = "0" + date.getMinutes();
    var second = "0" + date.getSeconds();
    return (
      month.substr(-2) +
      "월 " +
      day.substr(-2) +
      "일, " +
      hour.substr(-2) +
      ":" +
      minute.substr(-2) +
      ":" +
      second.substr(-2)
    );
  }

  function PreviewComponent() {
    return (
      <>
        <p>각 질문 문항에 대해 체크해주세요</p>
        <div className="grid">
          <p>1. 기분이 가라앉거나, 우울하거나, 희망이 없다고 느꼈다.</p>
          <Likert
            id="1"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq1.current = val["value"])}
          />
          &nbsp;
          <p>
            2. 평소 하던 일에 대한 흥미가 없어지거나 즐거움을 느끼지 못했다.
          </p>
          <Likert
            id="2"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq2.current = val["value"])}
          />
          &nbsp;
          <p>3. 잠들기가 어렵거나 자주 깼다/혹은 너무 많이 잤다.</p>
          <Likert
            id="3"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq3.current = val["value"])}
          />
          &nbsp;
          <p>4. 평소보다 식욕이 줄었다/혹은 평소보다 많이 먹었다.</p>
          <Likert
            id="4"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq4.current = val["value"])}
          />
          &nbsp;
          <p>
            5. 다른 사람들이 눈치 챌 정도로 평소보다 말과 행동 이 느려졌다/혹은
            너무 안절부절 못해서 가만히 앉아있을 수 없었다.
          </p>
          <Likert
            id="5"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq5.current = val["value"])}
          />
          &nbsp;
          <p>6. 피곤하고 기운이 없었다.</p>
          <Likert
            id="6"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq6.current = val["value"])}
          />
          &nbsp;
          <p>
            7. 내가 잘못 했거나, 실패했다는 생각이 들었다/혹은 자신과 가족을
            실망시켰다고 생각했다.
          </p>
          <Likert
            id="7"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq7.current = val["value"])}
          />
          &nbsp;
          <p>
            8. 신문을 읽거나 TV를 보는 것과 같은 일상적인 일에도 집중할 수가
            없었다.
          </p>
          <Likert
            id="8"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq8.current = val["value"])}
          />
          &nbsp;
          <p>
            9. 차라리 죽는 것이 더 낫겠다고 생각했다/혹은 자해할 생각을 했다.
          </p>
          <Likert
            id="9"
            responses={[
              { value: 0, text: "전혀 그렇지 않다" },
              { value: 1, text: "가끔 그렇다" },
              { value: 2, text: "자주 그렇다" },
              { value: 3, text: "거의 항상 그렇다" },
            ]}
            onChange={(val) => (phq9.current = val["value"])}
          />
        </div>
      </>
    );
  }

  function navigateToGuide() {
    navigate("/guide");
  }

  function navigateToGuide2() {
    navigate("/guide2");
  }

  function navigateToGuide3() {
    navigate("/guide3");
  }

  function navigateToGuide4() {
    navigate("/guide4");
  }

  function diaryInit(text, user, num) {
    return fetch(
      "https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/chat/diary",
      {
        method: "POST",
        body: JSON.stringify({
          text: text,
          user: user,
          num: num,
        }),
      }
    ).catch((err) => console.log(err));
  }

  function sendEmail() {
    const to = "dlwlsrnjs8316@gmail.com";
    const subject = "[마음챙김]" + props.userMail + "새로운 일기 작성 ";
    const body = "새로운 일기가 작성됨. 사용자id: " + props.userMail;

    fetch(
      "https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/chat/send-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, body }),
      }
    )
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  }

  function getMentalHealthStatus() {
    if (phq9.current > 1) {
      return "정말 힘드신 것 같습니다. 전문가의 도움이 꼭 필요합니다. 1588-9191에서도 도움을 받으실 수 있습니다.";
    } else if (phqTotal >= 0 && phqTotal <= 4) {
      return "안정적인 상태에요! 앞으로 계속 만나요!";
    } else if (phqTotal >= 5 && phqTotal <= 9) {
      return "조금 지친거 같아요. 도움이 필요할 수 있습니다.";
    } else if (phqTotal >= 10 && phqTotal <= 19) {
      return "정말 많이 힘들어보여요. 전문적인 상담이나 치료가 필요할 것 같아요. 우리 함께 힘내보아요";
    } else if (phqTotal >= 20 && phqTotal <= 27) {
      return "정말 힘드신 것 같습니다. 전문가의 도움이 꼭 필요합니다. 1588-9191에서도 도움을 받으실 수 있습니다.";
    } else {
      return "오류가 발생했어요";
    }
  }

  async function addConversationFromUser(input, comment) {
    let system_temp = { role: "assistant", content: prompt };
    let user_temp = { role: "user", content: input };
    let history_temp = {
      prompt: prompt,
      userInput: input,
      module: module,
      comment: comment,
      turn: turnCount.current,
    };

    const docRef2 = doc(db, "session", props.userMail, "diary", session);
    const docSnap2 = await getDoc(docRef2);
    if (docSnap2.exists()) {
      const message = docSnap2.data().conversation || [];
      const history = docSnap2.data().history || [];
      // 현재 대화를 배열에 추가
      const updatedConversation = [
        ...conversation,
        { role: "assistant", content: prompt },
        { role: "user", content: input },
      ];
      setConversation(updatedConversation);

      message[message.length] = system_temp;
      message[message.length] = user_temp;
      history[history.length] = history_temp;
      let a = setTimeout(async () => {
        await setDoc(
          docRef2,
          {
            conversation: message,
            outputFromLM: "",
            history: history,
          },
          { merge: true }
        );
        await updateDoc(docRef2, {
          turn: increment(1),
        });
        assemblePrompt();
        setLoading(true);
        notSpoken.current = true;
        setTextInput("");
      }, 500);
      return () => {
        clearTimeout(a);
      };
    } else {
      console.log("데이터 없음");
    }
  }

  if (surveyReady === true) {
    if (phqTotal === null) {
      return (
        <Container>
          <Row>
            <div className="loading_box">
              <span className="desktop-view">
                {date}
                <br />
                <b>오늘 나의 마음상태를 확인해봐요</b> 😀
              </span>
              <span className="smartphone-view">
                {date}
                <br />
                <b>
                  오늘 마음상태를
                  <br />
                  확인해봐요
                </b>{" "}
                😀
              </span>
            </div>
          </Row>
          <Row>
            <Col>
              {PreviewComponent()}
              <Button
                variant="primary"
                style={{ backgroundColor: "007AFF", fontWeight: "600" }}
                onClick={() => {
                  setPhqTotal(
                    phq1.current +
                      phq2.current +
                      phq3.current +
                      phq4.current +
                      phq5.current +
                      phq6.current +
                      phq6.current +
                      phq7.current +
                      phq8.current +
                      phq9.current
                  );
                }}
              >
                🌤️오늘의 마음상태 확인하기
              </Button>
            </Col>
          </Row>
          &nbsp;
        </Container>
      );
    } else {
      return (
        <Container>
          <Row>
            <div className="loading_box">
              <span className="desktop-view">
                <b>오늘의 일기 쓰기 완료</b> 😀
              </span>
              <span className="smartphone-view">
                <b>일기 쓰기 완료!</b> 😀
              </span>
            </div>
          </Row>
          <Row>
            <span className="desktop-view">
              <b>🧠 오늘의 정신건강</b>
              <br />
              {getMentalHealthStatus()}
            </span>
            <span className="smartphone-view-text">
              <b>🧠 오늘의 정신건강</b>
              <br />
              {getMentalHealthStatus()}
            </span>
            &nbsp;
            <span className="desktop-view">
              <b>
                🗓️ 오늘의 일기
                <br />
              </b>
              {diary}
              <br />               <br />
              <Button
                variant="primary"
                style={{ backgroundColor: "#3E8D56", fontWeight: "600" }}
                onClick={() => {
                  endSession();
                  handleShowDiagnosisModal(); // 모달 열기
                }}
              >
                👍 오늘의 일기쓰기 완료!
              </Button>
            </span>
            <span className="smartphone-view-text">
              <b>
                🗓️ 오늘의 일기
                <br />
              </b>
              {diary} <br />
              <br />
              <Button
                variant="primary"
                style={{ backgroundColor: "#3E8D56", fontWeight: "600" }}
                onClick={() => {
                  endSession();
                  handleShowDiagnosisModal(); // 모달 열기
                }}
              >
                👍 오늘의 일기쓰기 완료!
              </Button>
            </span>
          </Row>
          <Modal
            show={showDiagnosisModal}
            onHide={handleCloseDiagnosisModal}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>AI 진단 결과</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <span className="desktop-view">
                  <b>
                    🧠 정신상담사 모델 진단
                    <br />
                  </b>
                  {counselorDiagnosis
                    ? counselorDiagnosis
                    : "진단을 준비중입니다..."}
                  <br />
                  <br />
                </span>

                <span className="smartphone-view-text">
                  <b>
                    🧠 정신상담사 모델 진단
                    <br />
                  </b>
                  {counselorDiagnosis
                    ? counselorDiagnosis
                    : "진단을 준비중입니다..."}
                  <br />
                  <br />
                </span>

                {/* AI 진단 2: 정신과 의사 모델 */}
                <span className="desktop-view">
                  <b>
                    🧠 정신과 의사 모델 진단
                    <br />
                  </b>
                  {doctorDiagnosis ? doctorDiagnosis : "진단을 준비중입니다..."}
                  <br />
                  <br />
                </span>

                <span className="smartphone-view-text">
                  <b>
                    🧠 정신과 의사 모델 진단
                    <br />
                  </b>
                  {doctorDiagnosis ? doctorDiagnosis : "진단을 준비중입니다..."}
                  <br />
                  <br />
                </span>

                {/* AI 진단 3: Pocket-mind 자체 모델 */}
                <span className="desktop-view">
                  <b>
                    🧠 Pocket-mind 모델 진단
                    <br />
                  </b>
                  {pocketMindDiagnosis
                    ? pocketMindDiagnosis
                    : "진단을 준비중입니다..."}
                  <br />
                  <br />
                </span>

                <span className="smartphone-view-text">
                  <b>
                    🧠 Pocket-mind 모델 진단
                    <br />
                  </b>
                  {pocketMindDiagnosis
                    ? pocketMindDiagnosis
                    : "진단을 준비중입니다..."}
                  <br />
                  <br />
                </span>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDiagnosisModal}>
                닫기
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      );
    }
  } else if (sessionStatus === false) {
    return (
      <div>
        {isEvening ? (
          <Box minH={"calc(100vh - 130px)"} alignContent="center" mx="12px">
            <Flex flexDir={"column"}>
              <Text fontSize={"24px"}>
                {date}
                <br />
                Starting your mindfulness diary😀
              </Text>
              <Button
                backgroundColor={ColorSigniture}
                color={"white"}
                borderRadius={"20px"}
                _hover={{ backgroundColor: "#2E7546" }}
                onClick={() => {
                  const newSession = String(Math.floor(Date.now() / 1000));
                  setSession(newSession);
                  createNewDoc(newSession);
                  sendEmail();
                }}
              >
                📝 Start Journaling
              </Button>
              <Text mt={"20px"} fontWeight={500}>
                {" "}
                To continue an unfinished session,
                <br />
                please select an active session below
              </Text>
              <Row xs={"auto"} md={1} className="g-4">
                {existing.map((_, idx) => (
                  <Col key={idx}>
                    <Button
                      backgroundColor="#3E8D56"
                      color="white"
                      fontWeight="400"
                      borderRadius="10px"
                      _hover={{ backgroundColor: "#2E7546" }}
                      onClick={() => {
                        const newSession = String(
                          existing[idx]["sessionStart"]
                        );
                        setSession(newSession);
                        createNewDoc(newSession);
                      }}
                    >
                      {Unix_timestamp(existing[idx]["sessionStart"])}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Flex>
          </Box>
        ) : (
          <Container>
            <Row>
              <div className="loading_box">
                <span className="desktop-view">
                  <br />
                  마음챙김 다이어리는
                  <br />
                  <b>저녁 7시부터 밤12시 사이에 작성할 수 있어요.</b>
                  <br />
                  저녁에 다시만나요 🕰️
                </span>
                <span className="smartphone-view">
                  <br />
                  마음챙김 다이어리는
                  <br />
                  <b>
                    저녁 7시부터 밤12시 사이에
                    <br />
                    작성할 수 있어요.
                  </b>
                  <br />
                  저녁에 다시만나요 🕰️
                </span>
              </div>
            </Row>
            <Row>
              <Col>
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    style={{ backgroundColor: "#3E8D56", fontWeight: "600" }}
                    onClick={() => {
                      navigateToReview();
                    }}
                  >
                    📖 일기 다시보기
                  </Button>
                  <Form.Text className="text-muted">
                    내가 썼던 일기를 돌아보거나, 마음챙김 다이어리에 대해 더
                    알아보세요.
                  </Form.Text>
                </div>
              </Col>
              <Col></Col>
            </Row>
            <span className="center_temp">
              &nbsp;
              <Row xs={1} md={2} className="g-4">
                <Col>
                  <Card
                    onClick={() => {
                      navigateToGuide();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Img variant="top" src={book_purple} />
                    <Card.Body>
                      <Card.Title>
                        <b>일기쓰기와 정신건강</b>
                      </Card.Title>
                      <Card.Text>
                        일기를 작성하는 것이 어떻게 정신건강에 도움이 될까요?
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Card
                    onClick={() => {
                      navigateToGuide2();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Img variant="top" src={chat} />
                    <Card.Body>
                      <Card.Title>
                        <b>누구와 말하는 건가요?</b>
                      </Card.Title>
                      <Card.Text>
                        마음챙김 다이어리가 어떻게 동작 원리에 대해 알아봅니다.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Card
                    onClick={() => {
                      navigateToGuide3();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Img variant="top" src={lock} />
                    <Card.Body>
                      <Card.Title>
                        <b>개인정보는 어떻게 관리되나요?</b>
                      </Card.Title>
                      <Card.Text>
                        나의 데이터는 어떻게 관리되는지 알아봅니다.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Card
                    onClick={() => {
                      navigateToGuide4();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Img variant="top" src={book_blue} />
                    <Card.Body>
                      <Card.Title>
                        <b>어떻게 적는건가요?</b>
                      </Card.Title>
                      <Card.Text>
                        정신건강에 도움이 되는 일상 기록이란?
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </span>
            &nbsp;
          </Container>
        )}
      </div>
    );
  } else {
    return (
      <Container>
        <Row>
          <Col>
            <ChatBox conversation={conversation} />
          </Col>
        </Row>
        <Row>
          <div>
            {loading === true ? (
              <Loading />
            ) : (
              <Userinput
                prompt={prompt}
                setInputUser={setInputUser}
                inputUser={inputUser}
                addConversationFromUser={addConversationFromUser}
                setLoading={setLoading}
                turnCount={turnCount.current}
                setDiary={setDiary}
                textInput={textInput}
                setTextInput={setTextInput}
                toggleListening={toggleListening}
                isListening={isListening}
                setShow={setShow}
                show={show}
              />
            )}
          </div>
        </Row>
        <Row>
          {turnCount.current > 2 && loading === false ? (
            <DiaryView
              diary={diary}
              submitDiary={submitDiary}
              editDiary={editDiary}
              setModalShow={setModalShow}
            />
          ) : (
            <div></div>
          )}
        </Row>
        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
        />
        <div className="footer"></div>
      </Container>
    );
  }
}

function Loading() {
  return (
    <div>
      <Row>
        <Col>
          <div className="loading_box">
            <div>
              <HashLoader color="#3E8D56" speedMultiplier={0.9} />
            </div>
            &nbsp;
            <div>
              지금까지의 이야기를
              <br />
              정리중입니다
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Writing;
