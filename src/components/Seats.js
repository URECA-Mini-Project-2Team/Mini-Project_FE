import React, { useEffect, useState } from 'react';
import '../App.css';

function App() {
  const [seats, setSeats] = useState([]);
  const [columns, setColumns] = useState(8); // 열을 8로 설정
  const [token, setToken] = useState(''); // 로그인 시 발급된 토큰 저장

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
    console.log(seat.seatNo);
    if (!seat.status) { // 좌석이 비어 있을 때만 예약
      fetch('http://localhost:8080/ureca/reservation', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // 토큰 추가
        },
        body: JSON.stringify({ seatNo: seat.seatNo }) // 좌석 번호 전송
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text) });
        }
        return response.text();
      })
      .then(data => {
        alert('좌석이 성공적으로 예약되었습니다.');
        fetchSeats(); // 좌석 정보 새로고침
      })
      .catch(error => alert('좌석 예약에 실패했습니다. ' + error.message));
    } else {
      alert(`이미 예약된 좌석입니다. \n예약자: ${seat.nickName} (${seat.userName})`);
    }
  };

  const handleCancelSeat = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
  
    // 바로 좌석 취소 요청
    const isConfirmed = window.confirm('정말로 예약을 취소하시겠습니까?');
    
    if (isConfirmed) {
      fetch('http://localhost:8080/ureca/delete', { // 좌석 취소 API
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.message || '좌석 취소에 실패했습니다.');
            });
          }
          alert('좌석이 성공적으로 취소되었습니다.');
          fetchSeats(); // 좌석 정보 새로고침
        })
        .catch(error => alert(error.message));
    }
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
