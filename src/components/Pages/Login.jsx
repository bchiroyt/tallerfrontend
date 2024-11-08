import { useState, useEffect } from 'react';
import LogoTaller from '../../assets/logobike.jpg';
import { useNavigate } from 'react-router-dom';
import "../styles/login.css"

function Login() {
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_URL


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    
    setTimeout(() => {
      setLoading(false); 
    }, 3000);
  }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      const response = await fetch(
        `${URL}/login`,
         { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, 
          password, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        
        localStorage.setItem("token", data.token); 

        
        navigate("/inicio");
      } else {
        
        setError(data.msg || "Error al iniciar sesión"); 
      }
    } catch (error) {
      setError("Error del servidor, inténtalo más tarde");
      console.error(error);
    }
  };

  return (
    <>
      {loading ? (
       
        <div className="loading-screen">
          <img src={LogoTaller} className="logo react" alt="Taller logo" />
          <h1>Cargando...</h1>
        </div>
      ) : (
        
        <div className="login-container">
          <img src={LogoTaller} className="logo" alt="Taller logo" />
          <h2>Iniciar Sesión</h2>
          {error && <p className="error-message">{error}</p>} 
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico:</label>
              <input 
                type="email" 
                id="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input 
                type="password" 
                id="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <button className="BTenviar" id="btn-login" type="submit"> Ingresar</button>
          </form>
        </div>
      )}
    </>
  );
}

export default Login;