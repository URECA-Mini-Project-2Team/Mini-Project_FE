import React, { useState } from 'react';

function SignIn() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = () => {
    fetch('http://localhost:8080/ureca/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, password }),
    })
      .then((response) => {
        if (response.ok) { // 상태 코드가 2xx인지 확인
          return response.json();
        } else {
          throw new Error('로그인 실패');
        }
      })
      .then((data) => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setMessage('로그인 성공');
        } else {
          setMessage('로그인 실패');
        }
      })
      .catch((error) => setMessage(error.message)); // 실제 오류 메시지 표시
  };

  return (
    <div>
      <h2>Sign In</h2>
      <div>
        <label>userName:</label>
        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button onClick={handleSignIn}>Sign In</button>
      <p>{message}</p>
    </div>
  );
}

export default SignIn;
