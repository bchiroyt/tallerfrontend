import '../styles/inicio.css'; 
import LogoInicio from '../../assets/Inicio.jpg';

function Inicio() {
  return (
    <div className='cont'>
      <br/>
      <br/>
      <br/>
    <div className="inicio-container">      
      <img src={LogoInicio} className='logobici' />      
      <h2>Bienvenido al Sistema de Gestión de Operaciones del Taller</h2>
      <p>Selecciona un módulo para comenzar.</p>
    </div>
    </div>
  );
} 

export default Inicio;