import { useState, useEffect } from 'react';
import LogoTaller from '../../assets/logobike.jpg'; // Ruta del logo
import { useNavigate } from 'react-router-dom';
import "../styles/login.css"

function Login() {
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_URL

  // Estados para email, contraseña y mensaje de error
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Estado para la pantalla de carga

  useEffect(() => {
    // Simula un tiempo para mostrar el logo
    setTimeout(() => {
      setLoading(false); // Después de 3 segundos, desaparece la pantalla de carga y muestra el login
    }, 3000);
  }, []);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    try {
      const response = await fetch(
        `${URL}/login`,
         { // Cambia la URL si es necesario
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // Aquí enviamos email
          password, // Y aquí la contraseña
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guarda el token en localStorage
        localStorage.setItem("token", data.token); // Cambié a `data.token` porque el token está en `data.token`

        // Redirige a la página de inicio
        navigate("/inicio");
      } else {
        // Muestra el mensaje de error si la autenticación falla
        setError(data.msg || "Error al iniciar sesión"); // Modifiqué para que el backend envíe `msg` en vez de `error`
      }
    } catch (error) {
      setError("Error del servidor, inténtalo más tarde");
      console.error(error);
    }
  };

  return (
    <>
      {loading ? (
        // Pantalla de carga con el logo del taller
        <div className="loading-screen">
          <img src={LogoTaller} className="logo react" alt="Taller logo" />
          <h1>Cargando...</h1>
        </div>
      ) : (
        // Pantalla de Login cuando el logo desaparece
        <div className="login-container">
          <h2>Iniciar Sesión</h2>
          {error && <p className="error-message">{error}</p>} {/* Muestra el mensaje de error si lo hay */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico:</label>
              <input 
                type="email" 
                id="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} // Actualiza el estado de email
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input 
                type="password" 
                id="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} // Actualiza el estado de password
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