import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [seats, setSeats] = useState([]);
  const [columns, setColumns] = useState(8); // 열을 8로 설정

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = () => {
    fetch('http://localhost:8080/ureca/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setSeats(data))
      .catch((error) => console.error('Error fetching seat data:', error));
  };

  const handleSeatClick = (seat) => {
    if (seat.status) {
      alert(`예약된 좌석입니다.\n아이디 : ${seat.nickName}\n사용자 이름 : ${seat.userName}`);
    } else {
      const newWindow = window.open('', '_blank', 'width=600,height=400');
  
      newWindow.document.write(`
        <html>
          <head>
            <title>좌석 예약</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              form {
                display: flex;
                flex-direction: column;
              }
              div {
                margin-bottom: 10px;
              }
              .error {
                color: red;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <h2>좌석 예약</h2>
            <form id="reservationForm">
              <div>
                <label>이름 : </label>
                <input type="text" name="userName" id="userName" />
                <span id="userNameError" class="error"></span>
              </div>
              <div>
                <label>아이디 : </label>
                <input type="text" name="nickName" id="nickName" />
                <span id="nickNameError" class="error"></span>
              </div>
              <div>
                <label>비밀번호 : </label>
                <input type="password" name="password" id="password" />
                <span id="passwordError" class="error"></span>
              </div>
              <button type="button" id="reserveBtn">예약하기</button>
            </form>
            <div id="message"></div>
          </body>
        </html>
      `);
  
      newWindow.document.getElementById('reserveBtn').onclick = function () {
        const userName = newWindow.document.getElementById('userName').value;
        const nickName = newWindow.document.getElementById('nickName').value;
        const password = newWindow.document.getElementById('password').value;
  
        const newErrors = {};
        if (!userName) newErrors.userName = '이름을 입력해 주세요.';
        if (!nickName) newErrors.nickName = '아이디을 입력해 주세요.';
        if (!password) newErrors.password = '비밀번호를 입력해 주세요.';
  
        if (Object.keys(newErrors).length > 0) {
          newWindow.document.getElementById('userNameError').textContent = newErrors.userName || '';
          newWindow.document.getElementById('nickNameError').textContent = newErrors.nickName || '';
          newWindow.document.getElementById('passwordError').textContent = newErrors.password || '';
        } else {
          fetch('http://localhost:8080/ureca/reservation', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName, nickName, password, seatNo: seat.seatNo }),
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((errorData) => {
                  throw new Error(errorData.message || '서버 에러가 발생했습니다.');
                });
              }
              return response.text(); 
            })
            .then((responseText) => {
              if (responseText) {
                try {
                  const data = JSON.parse(responseText);
                  console.log('Success:', data);
                } catch (error) {
                  console.warn('Failed to parse response as JSON:', error);
                }
              }
  
              newWindow.alert('좌석이 성공적으로 예약되었습니다.');
              fetchSeats(); // 좌석 정보 새로고침
              newWindow.close(); // 창 닫기
            })
            .catch((error) => {
              newWindow.document.getElementById('message').textContent = error.message;
              newWindow.document.getElementById('message').style.color = 'red';
            });
        }
      };
    }
  };

  const handleCancelSeat = () => {
    const cancelWindow = window.open('', '_blank', 'width=400,height=300');
  
    cancelWindow.document.write(`
      <html>
        <head>
          <title>자리 예약 취소</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            form {
              display: flex;
              flex-direction: column;
            }
            div {
              margin-bottom: 10px;
            }
            .error {
              color: red;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h2>자리 예약 취소</h2>
          <form id="cancelForm">
            <div>
              <label>아이디 : </label>
              <input type="text" name="nickName" id="nickName" />
              <span id="nickNameError" class="error"></span>
            </div>
            <div>
              <label>비밀번호 : </label>
              <input type="password" name="password" id="password" />
              <span id="passwordError" class="error"></span>
            </div>
            <button type="button" id="cancelBtn">취소하기</button>
          </form>
          <div id="message"></div>
        </body>
      </html>
    `);
  
    cancelWindow.document.getElementById('cancelBtn').onclick = function () {
      const nickName = cancelWindow.document.getElementById('nickName').value;
      const password = cancelWindow.document.getElementById('password').value;
  
      const newErrors = {};
      if (!nickName) newErrors.nickName = '아이디을 입력해 주세요.';
      if (!password) newErrors.password = '비밀번호를 입력해 주세요.';
  
      if (Object.keys(newErrors).length > 0) {
        cancelWindow.document.getElementById('nickNameError').textContent = newErrors.nickName || '';
        cancelWindow.document.getElementById('passwordError').textContent = newErrors.password || '';
      } else {
        // 사용자 확인 대화상자 표시
        const isConfirmed = cancelWindow.confirm('정말로 예약을 취소하시겠습니까?');
        if (isConfirmed) {
          fetch('http://localhost:8080/ureca/delete', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickName, password }),
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((errorData) => {
                  throw new Error(errorData.message || '서버 에러가 발생했습니다.');
                });
              }
              return response.text();
            })
            .then((responseText) => {
              if (responseText) {
                try {
                  const data = JSON.parse(responseText);
                  console.log('Success:', data);
                } catch (error) {
                  console.warn('Failed to parse response as JSON:', error);
                }
              }
  
              cancelWindow.alert('좌석이 성공적으로 취소되었습니다.');
              fetchSeats(); // 좌석 정보 새로고침
              cancelWindow.close(); // 창 닫기
            })
            .catch((error) => {
              cancelWindow.document.getElementById('message').textContent = error.message;
              cancelWindow.document.getElementById('message').style.color = 'red';
            });
        }
      }
    };
  };

  return (
    <div className="App">
      <div className="fixed-header">
        <h1>백엔드 자리 현황</h1>
        <div className="column-input">
          <label>가로 길이: </label>
          <input
            type="number"
            value={columns}
            onChange={(e) => setColumns(parseInt(e.target.value))}
            min="1"
            max={seats.length}
          />
        </div>
      </div>
      <div className="seat-wrapper">
        <div className="screen">스크린</div> {/* 스크린 추가 */}
        <div
          className="seat-container"
          style={{
            gridTemplateColumns: `repeat(${columns}, 50px)`,
            gridTemplateRows: `repeat(${Math.ceil(seats.length / columns)}, 50px)`,
          }}
        >
          {seats.map((seat, index) => (
            <button
              key={index}
              className={`seat ${seat.status ? 'reserved' : 'available'}`}
              onClick={() => handleSeatClick(seat)}
            >
              {seat.seatNo}
            </button>
          ))}
        </div>
      </div>
      <button className="cancel-seat-button" onClick={handleCancelSeat}>자리 취소</button>
    </div>
  );
}

export default App;
