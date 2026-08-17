import { useEffect, useState, useRef } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import React from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import Modal from 'react-bootstrap/Modal';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    increment,
    doc,
    getDoc,
    setDoc
} from "firebase/firestore";

import { db } from "../firebase-config";
import { Flex, Text, Box, Button } from "@chakra-ui/react";
import { ColorButtomPink } from "../utils/_Palette";


/* eslint-disable no-inner-declarations */

function DiaryList(props) {
    const [diaryList, setDiaryList] = useState([]);
    const updateProgress = useRef(true);
    const [emptyList, setEmptyList] = useState(false);
    const [refresh, setRefresh] = useState(1);
    const [userType, setUserType] = useState(null);  // 의사 또는 환자 정보 저장
    const [feedback, setFeedback] = useState({});  // 피드백 상태 저장
    const [editingFeedback, setEditingFeedback] = useState({}); // 피드백 수정 상태 저장
    const [unfinishedFeedbackCount, setUnfinishedFeedbackCount] = useState(0); // 피드백 미완료 개수

    // 모달 상태 관리
    const [showModal, setShowModal] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState("");  // 프롬프트 상태 관리
    const [selectedPatientEmail, setSelectedPatientEmail] = useState(null); // 선택한 환자의 이메일
    const [selectedSessionNumber, setSelectedSessionNumber] = useState(null); // 선택한 세션 번호

    // AI 진단 모달 상태 관리
    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
    const [aiDiagnosis, setAIDiagnosis] = useState({
        counselorDiagnosis: '',
        doctorDiagnosis: '',
        pocketMindDiagnosis: ''
    });

    // 사용자 유형을 Firestore에서 확인하여 의사 또는 환자 구분
    useEffect(() => {
        async function fetchUserType() {
            const userDocRef = doc(db, "doctor", props.userMail);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setUserType("doctor");
                console.log("의사 계정입니다. 이메일: ", props.userMail);
            } else {
                setUserType("patient");
                console.log("환자 계정입니다. 이메일: ", props.userMail);
            }
        }

        fetchUserType();
    }, [props.userMail]);

    // userType이 설정된 후에 일기 데이터를 가져옴
    useEffect(() => {
        if (userType) {
            async function renewList() {
                const diary = await receiveDiaryData();
                setDiaryList(diary);
                updateProgress.current = false;
            }

            if (updateProgress.current) {
                renewList();
            } else {
                if (diaryList.length === 0) {
                    setEmptyList(true);
                }
            }
        }
    }, [userType]);  // userType이 변경될 때마다 실행

    // AI 진단 결과 데이터를 Firestore에서 불러오는 함수
    const fetchDiagnosisData = async (userMail, date) => {
        const diagnosisDocRef = doc(db, "diagnosis", userMail, "dates", date);
        const diagnosisDoc = await getDoc(diagnosisDocRef);
        if (diagnosisDoc.exists()) {
            const data = diagnosisDoc.data();
            setAIDiagnosis({
                counselorDiagnosis: data.counselorDiagnosis || '상담사 진단 없음',
                doctorDiagnosis: data.doctorDiagnosis || '의사 진단 없음',
                pocketMindDiagnosis: data.pocketMindDiagnosis || 'Pocket-Mind 진단 없음'
            });
        } else {
            setAIDiagnosis({
                counselorDiagnosis: '상담사 진단 없음',
                doctorDiagnosis: '의사 진단 없음',
                pocketMindDiagnosis: 'Pocket-Mind 진단 없음'
            });
        }
        setShowDiagnosisModal(true);
    };

    const handleDiagnosisView = async (userMail, date) => {
        console.log(userMail)
        console.log(date)
        await fetchDiagnosisData(userMail, date);
    };



    const handlePromptEdit = async (patientEmail) => {
        setSelectedPatientEmail(patientEmail);

        // Firestore에서 해당 환자의 프롬프트를 불러옴
        const promptDocRef = doc(db, "prompt", patientEmail);
        const promptDoc = await getDoc(promptDocRef);
        if (promptDoc.exists()) {
            setCurrentPrompt(promptDoc.data().prompt || "");  // 기존 프롬프트 불러오기
        } else {
            setCurrentPrompt("");  // 기존 프롬프트가 없을 경우 빈 값
        }
        setShowModal(true); // 모달창 표시
    };

    // 프롬프트 수정 후 저장하는 함수
    const savePrompt = async () => {
        const promptDocRef = doc(db, "prompt", selectedPatientEmail);
        await setDoc(promptDocRef, { prompt: currentPrompt });
        setShowModal(false); // 모달창 닫기
        alert("프롬프트가 성공적으로 저장되었습니다.");
    };

    async function getRelatedEmail(userMail, userType) {
        console.log("Fetching related email for:", userMail, userType);

        try {
            if (userType === "patient") {
                // 'patient' 컬렉션에서 환자의 이메일을 사용하여 문서를 가져옴
                const patientDocRef = doc(db, 'patient', props.userMail);
                const patientDoc = await getDoc(patientDocRef);

                if (patientDoc.exists()) {
                    // 문서가 존재할 경우 담당 의사 정보 가져오기
                    const doctorEmail = patientDoc.data().doctor;
                    console.log(doctorEmail[0]);
                    return doctorEmail[0];  // 배열이면 첫 번째 이메일만 사용
                } else {
                    console.error("해당 환자 담당, 의사 문서가 존재하지 않습니다.");
                    return null;
                }
            } else if (userType === "doctor") {
                // 'doctor' 컬렉션에서 의사의 이메일을 사용하여 문서를 가져옴
                const doctorDocRef = doc(db, 'doctor', props.userMail);
                const doctorDoc = await getDoc(doctorDocRef);

                if (doctorDoc.exists()) {
                    // 문서가 존재할 경우 담당 환자 목록 가져오기
                    const patientEmail = doctorDoc.data().patient;
                    console.log(patientEmail[0]);
                    return patientEmail[0];  // 환자 이메일 반환
                } else {
                    console.error("해당 의사 관련, 환자의 문서가 존재하지 않습니다.");
                    return null;
                }
            } else {
                console.log(userType);
                console.error("올바른 userType을 전달해주세요. 'patient' 또는 'doctor'만 가능합니다.");
                return null;
            }
        } catch (error) {
            console.error("의사 또는 환자 정보를 가져오는 중 오류 발생:", error);
            return null;
        }
    }

    function Unix_timestamp_to_YYYYMMDD(t) {
        const date = new Date(t * 1000); // Unix 타임스탬프를 Date 객체로 변환
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // "YYYY-MM-DD" 형식으로 반환
    }

    async function sendDiaryNotificationToBackend(email, Content) {
        // try {
        //     console.log("Starting to send notification to backend...");
        //     console.log("email:", email);
        //     console.log("Diary content (first 20 characters):", Content.slice(0, 20));
        //     console.log(userType)
        //     const notificationTitle = userType === "patient"
        //         ? `${props.userMail} 환자 일기 알림`  // 환자가 접속한 경우 담당 의사에게 보낼 제목 (환자 이메일 포함)
        //         : '새로운 피드백 알림';  // 의사가 접속한 경우 환자에게 보낼 제목

        //     const notificationBody = userType === "patient"
        //         ? `${props.userMail} 환자가 새로운 일기를 작성했습니다: ${Content.slice(0, 20)}...`  // 환자가 접속했으니 의사에게 보낼 메시지 (환자 이메일 포함)
        //         : `담당 상담사(의사)가 새로운 피드백을 남겼습니다`;  // 의사가 접속했으니 환자에게 보낼 피드백 메시지

        //     const response = await fetch('https://pocket-mind-bot-43dbd1ff9e7a.herokuapp.com/fcm/send-notification', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             email: email,
        //             title: notificationTitle,
        //             body: notificationBody,
        //             userType: userType
        //         }),
        //     });
        //     console.log("Fetch request sent. Waiting for response...");

        //     if (!response.ok) {
        //         const errorData = await response.text();
        //         console.error('Error sending notification:', errorData);
        //     } else {
        //         const result = await response.json();
        //         console.log('Notification sent successfully:', result);
        //     }
        // } catch (error) {
        //     console.error('Error sending notification to backend:', error);
        // }
    }

    function Unix_timestamp(t) {
        const date = new Date(t * 1000);
        const year = date.getFullYear();
        const month = "0" + (date.getMonth() + 1);
        const day = "0" + date.getDate();
        return `${year}년 ${month.substr(-2)}월 ${day.substr(-2)}일 `;
    }

    function Unix_timestamp2(t) {
        const date = new Date(t * 1000);
        const hour = "0" + date.getHours();
        const minute = "0" + date.getMinutes();
        return `${hour.substr(-2)}시 ${minute.substr(-2)}분 작성됨`;
    }

    async function addLike(idx) {
        const findSession = diaryList[idx]["sessionNumber"];
        const diaryCollectionRef = collection(db, 'session', props.userMail, 'diary');
        const q = query(diaryCollectionRef, where('sessionNumber', '==', findSession));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
                like: increment(1)
            });
            updateProgress.current = true;
            setRefresh(refresh + 1);
        } else {
            console.log('No document found with the given sessionNumber');
        }
    }

    async function addMuscle(idx) {
        const findSession = diaryList[idx]["sessionNumber"];
        const diaryCollectionRef = collection(db, 'session', props.userMail, 'diary');
        const q = query(diaryCollectionRef, where('sessionNumber', '==', findSession));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
                muscle: increment(1)
            });
            updateProgress.current = true;
            setRefresh(refresh + 1);
        } else {
            console.log('No document found with the given sessionNumber');
        }
    }

    async function handleFeedbackSubmit(idx, patientEmail, sessionNumber) {
        const feedbackText = feedback[idx] || ""; // 피드백 입력 값 가져오기
        if (feedbackText) {
            const diaryDocRef = doc(db, 'session', patientEmail, 'diary', sessionNumber);
            await updateDoc(diaryDocRef, {
                feedback: feedbackText
            });
            console.log("피드백 저장 완료:", feedbackText);
            // Firestore에서 담당 의사, 관련 환자 정보를 가져옴
            const relatedEmail = await getRelatedEmail(props.userMail, userType);

            if (relatedEmail) {
                await sendDiaryNotificationToBackend(relatedEmail, feedbackText);  // 담당 의사의 이메일과 일기내용 전달
            } else {
                console.error("정보를 가져올 수 없습니다.");
            }

            // 피드백이 저장되면 상태를 업데이트하여 화면만 새로고침
            setDiaryList((prevState) => {
                const updatedDiaryList = [...prevState];
                updatedDiaryList[idx].feedback = feedbackText;
                return updatedDiaryList;
            });

            // 피드백 저장 후 수정 상태 해제
            toggleFeedbackEdit(idx);
        }
    }

    const handleFeedbackChange = (idx, value) => {
        setFeedback((prevState) => ({
            ...prevState,
            [idx]: value
        }));
    };

    const toggleFeedbackEdit = (idx) => {
        setEditingFeedback((prevState) => ({
            ...prevState,
            [idx]: !prevState[idx]  // 현재 상태와 반대값으로 토글
        }));
    };

    async function receiveDiaryData() {
        let tempArr = [];
        let unfinishedFeedbackCount = 0;

        if (userType === "doctor") {
            const userDocRef = doc(db, "doctor", props.userMail);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                // const patients = userDoc.data().patient;
                // for (const patientEmail of patients) {
                //     const diaryCompleteCollRef = collection(db, 'session', patientEmail, 'diary');
                //     const q = query(diaryCompleteCollRef, where('isFinished', '==', true));

                //     try {
                //         const querySnapshot = await getDocs(q);
                //         querySnapshot.forEach((doc) => {
                //             const data = doc.data();
                //             if (data.sessionEnd && data.diary) {
                //                 if (!data.feedback) {
                //                     unfinishedFeedbackCount++;
                //                 }
                //                 tempArr.push({
                //                     ...data,
                //                     patientEmail: patientEmail,
                //                     sessionNumber: doc.id
                //                 });
                //             }
                //         });
                //     } catch (error) {
                //         console.error(`Error fetching diary for patient ${patientEmail}:`, error);
                //     }
                // }

                tempArr.sort((a, b) => (a.feedback ? 1 : -1));
                setUnfinishedFeedbackCount(unfinishedFeedbackCount);
            }
        } else {
            const diaryCompleteCollRef = collection(db, 'session', props.userMail, 'diary');
            const q = query(diaryCompleteCollRef, where('isFinished', '==', true));

            try {
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.sessionEnd && data.diary) {
                        tempArr.push(data);
                    }
                });
            } catch (error) {
                console.error("Error fetching diary:", error);
            }
        }

        if (tempArr.length === 0) {
            setEmptyList(true);
        }

        return tempArr;
    }

    if (emptyList === true) {
        return (
            <Box minH={'calc(100vh - 130px)'} >
                <Flex flexDir={'column'} mx='12px' mt='20px'>
                   <Text fontWeight={700} fontSize={'24px'} mb='5px'>환자 일기 피드백</Text>
                  <Text fontWeight={400} fontSize={'15px'}>🥲 아직 작성한 일기가 없어요.<br/> 첫 일기를 작성해볼까요?</Text>         
               </Flex>
               </Box>
        );
    } else {
        return (
            <Box minH={'calc(100vh - 130px)'} >
                 <Flex flexDir={'column'} mx='12px' mt='20px'>
                   <Text fontWeight={700} fontSize={'20px'} mb='5px'>일기 피드백</Text>
                  <Text fontWeight={700} fontSize={'20px'}>피드백 미완료: {unfinishedFeedbackCount}</Text>  
                  {diaryList.map((diary, idx) => (
                    <>
                        <Flex key={idx} flexDir={'column'}  padding='15px' mb='15px' borderRadius={'15px'} backgroundColor={'#F1F8F4'} boxShadow="0 2px 8px rgba(62, 141, 86, 0.08)"
>
                            <Text fontSize={'16px'} fontWeight={700} mb='2px'>{diary.sessionEnd ? Unix_timestamp(diary["sessionEnd"]) : "작성일 없음"}</Text>
                            <Text  fontSize={'14px'} fontWeight={400} mb='5px'> {diary.sessionEnd ? Unix_timestamp2(diary["sessionEnd"]) : "작성 시간 없음"}</Text>
                            {userType === "doctor" && (
                                    <div className="nav_title_blue">환자 이메일: {diary.patientEmail}
                                        <Button
                                            variant="secondary"
                                            onClick={() => handlePromptEdit(diary.patientEmail)}
                                        > 프롬프트 확인/수정 </Button>
                                     </div>
                            )}
                              <Button
                               backgroundColor={ColorButtomPink}
                               color="white"
                               borderRadius={'20px'}
                               fontSize={'15px'}
                               my='10px'
                               height={'35px'}
                               _hover={{ backgroundColor: "#4FA855" }}
                               onClick={() => handleDiagnosisView(diary.patientEmail, Unix_timestamp_to_YYYYMMDD(diary["sessionEnd"]))}
                             > 이날의 AI 진단 보기</Button>
                             <Text  fontSize={'14px'} fontWeight={500} >{diary["diary"]}</Text>
                             <Flex>
                             <Text onClick={() => addLike(idx)} mr={'10px'}>️❤️</Text> <b>{diary["like"]}</b>
                             <Text className="likebutton" onClick={() => addMuscle(idx)}  mr={'10px'}>&nbsp;&nbsp;&nbsp;💪️ </Text><b>{diary["muscle"]}</b>
                             </Flex>
                                                    {userType === "doctor" ? (
                                                        <>
                                                            {editingFeedback[idx] ? (
                                                                <Form.Group controlId={`feedbackForm-${idx}`}>
                                                                    <Form.Label>피드백 입력:</Form.Label>
                                                                    <Form.Control
                                                                        as="textarea"
                                                                        rows={3}
                                                                        value={feedback[idx] || ""}
                                                                        onChange={(e) => handleFeedbackChange(idx, e.target.value)}
                                                                    />
                                                                    <Button
                                                                        variant="primary"
                                                                        onClick={() => handleFeedbackSubmit(idx, diary.patientEmail, diary.sessionNumber)}
                                                                    >
                                                                        피드백 저장
                                                                    </Button>

                                                                </Form.Group>
                                                            ) : (
                                                                <div>
                                                                    <strong>저장된 피드백:</strong> {diary.feedback || "피드백을 입력하세요"}
                                                                    <Button variant="link" onClick={() => toggleFeedbackEdit(idx)}>
                                                                        {diary.feedback ? "수정하기" : "입력하기"}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <strong>저장된 피드백:</strong> {diary.feedback || "아직 피드백이 없습니다."}
                                                        </div>
                                                    )}
                        </Flex>
                    </>
                                  
                    ))}    
                    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>프롬프트 수정</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group controlId="promptTextarea">
                                <Form.Label>현재 프롬프트:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={currentPrompt}
                                    onChange={(e) => setCurrentPrompt(e.target.value)}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                취소
                            </Button>
                            <Button variant="primary" onClick={savePrompt}>
                                저장
                            </Button>
                        </Modal.Footer>
                    </Modal>
      
 
                <Modal show={showDiagnosisModal} onHide={() => setShowDiagnosisModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>AI 진단 결과</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>상담사 모델 진단:</h5>
                        <p>{aiDiagnosis.counselorDiagnosis}</p>
                        <h5>의사 모델 진단:</h5>
                        <p>{aiDiagnosis.doctorDiagnosis}</p>
                        <h5>Pocket-Mind 모델 진단:</h5>
                        <p>{aiDiagnosis.pocketMindDiagnosis}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDiagnosisModal(false)}>
                            닫기
                        </Button>
                    </Modal.Footer>
                </Modal>
         
               </Flex>
            </Box>
        );
    }
}

export default DiaryList;