import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RHStyle.css'; // Asegúrate de que el path es correcto

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      navigate('/admin/dashboard');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <h1>Perfil Administrador</h1>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" onClick={handleLogin}>Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
