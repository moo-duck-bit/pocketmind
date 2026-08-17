import { useState } from "react";
import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { BeatLoader, HashLoader } from "react-spinners";
function DiaryView({ diary, saveDiary }) {
  const [editMode, setEditMode] = useState(false);
  const [diaryedit, setDiaryedit] = useState("");

  if (diary === "") {
    return (
      <div className="inwriting_review_box">
        <Row>
          <div className="loading_box_2">
            <div>
              <BeatLoader color="#3E8D56" speedMultiplier={0.6} />
            </div>
            <span className="desktop-view">
              <Form.Text id="userInput" muted>
                <div style={{ fontSize: "20px" }}>
                  일기 작성중입니다. 다이어리 작성을 더 진행해주세요
                </div>
              </Form.Text>
            </span>
            <span className="smartphone-view">
              <Form.Text id="userInput" muted>
                <div style={{ fontSize: "15px" }}>
                  일기 작성중입니다.
                  <br />
                  다이어리 작성을 더 진행해주세요
                </div>
              </Form.Text>
            </span>
          </div>
        </Row>
      </div>
    );
  } else if (editMode === false) {
    return (
      <div className="inwriting_review_box">
        &nbsp;
        <Row xs={"auto"} md={1} className="g-4">
          <Col>
            <Card
              style={{
                width: "100%",
              }}
            >
              <Card.Body>
                <Card.Title>오늘의 마음챙김 다이어리</Card.Title>
                <Card.Text>
                  <div>{diary}</div>
                </Card.Text>
                &nbsp;
                {/* <Card.Subtitle className="mb-2 text">
                  <span
                    className="likebutton"
                    onClick={() => {
                      //   setEditMode(true);
                      //   setDiaryedit(diary);
                    }}
                  >
                    ✍️수정하기️
                  </span>
                </Card.Subtitle> */}
              </Card.Body>
            </Card>

            <Col>
              <div className="submission"></div>
              <div className="d-grid gap-2">
                <Button
                  variant="dark"
                  style={{
                    backgroundColor: "#3E8D56",
                    fontWeight: "600",
                    marginBottom: "10px",
                    borderRadius: "10px"
                  }}
                  onClick={() => {
                    saveDiary();
                  }}
                >
                  📝 일기 저장하고 종료하기
                </Button>
              </div>
              <div className="footer"></div>
            </Col>
          </Col>
        </Row>
      </div>
    );
  } else if (editMode) {
    return (
      <div className="inwriting_review_box">
        <Form.Label htmlFor="userInput">
          <span className="desktop-view">📝️ 내용을 수정해주세요</span>
          <span className="smartphone-view-text-tiny">
            📝️ 내용을 수정해주세요
          </span>
        </Form.Label>
        <Form.Control
          type="text"
          as="textarea"
          rows={5}
          id="userInput"
          value={diaryedit}
          //   onChange={(e) => setDiaryedit(e.target.value)}
        />

        <div className="submission"></div>
        <div className="d-grid gap-2">
          <Button
            variant="dark"
            style={{ backgroundColor: "#3E8D56", fontWeight: "600" }}
            onClick={() => {
              //   editDiary(diaryedit);
              setEditMode(false);
            }}
          >
            📝 일기 수정완료
          </Button>
        </div>
        <div className="footer"></div>
      </div>
    );
  }
}

export default DiaryView;
