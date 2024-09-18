import React, { useState } from 'react';

function SignUp() {
  const [userName, setUserName] = useState('');
  const [nickName, setNickName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = () => {
    fetch('http://localhost:8080/ureca/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, nickName, password }),
    })
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error('회원가입 실패');
        }
      })
      .then((data) => setMessage(data))
      .catch((error) => setMessage(error.message));
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <div>
        <label>User Name:</label>
        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
      </div>
      <div>
        <label>Nick Name:</label>
        <input type="text" value={nickName} onChange={(e) => setNickName(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button onClick={handleSignUp}>Sign Up</button>
      <p>{message}</p>
    </div>
  );
}

export default SignUp;
