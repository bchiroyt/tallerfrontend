import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Pages/Login";
import Usuario from "./components/Pages/Usuario";
import MainLayout from "./components/Pages/MainLayout";
import Inicio from "./components/Pages/Inicio";
import PrivateRoute from "./components/Rutasprotegidas"; 
import Accesorios from "./components/Pages/Accesorios";
import AccesorioDetalles from "./components/Pages/AccesorioDetalles";
import Categoria from "./components/Pages/Categoria";
import RolesModulosPermisos from "./components/Pages/RolesModulosPermisos";
import Productos from "./components/Pages/Productos";
import ProductoDetalles from "./components/Pages/ProductoDetalles";
import Bicicletas from "./components/Pages/Bicicletas";
import BicicletaDetalles from "./components/Pages/BicicletaDetalles";
import Proveedor from "./components/Pages/Proveedor";
import ListaCompra from "./components/Pages/ListaCompra";
import NuevaCompra from "./components/Pages/NuevaCompra";
import DetalleCompra from "./components/Pages/DetalleCompra";
import Clientes from "./components/Pages/Clientes"
import Citas from "./components/Pages/Citas";
import Servicio from "./components/Pages/Servicio";
import GestionCaja from "./components/Pages/GestionCaja";
import Ventas from "./components/Pages/Ventas";
import ListaVentas from "./components/Pages/ListaVentas";
import Reembolsos from "./components/Pages/Reembolsos";
import ReportesIngresos from "./components/Pages/ReportesIngresos";
import ReportesVentas from "./components/Pages/ReportesVentas";
import ConsultaVentas from "./components/Pages/ConsultaVenta"
import ConsultaCompra from "./components/Pages/ConsultaCompra"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta para Login (sin Header ni barra de navegación) */}
        <Route path="/" element={<Login />} />
        
        {/* Rutas con MainLayout, protegidas por PrivateRoute */}
        <Route
          path="/inicio"
          element={
            <PrivateRoute>
              <MainLayout>
                <Inicio />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/usuario"
          element={
            <PrivateRoute>
              <MainLayout>
                <Usuario />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/rolesmodulospermisos"
          element={
            <PrivateRoute>
              <MainLayout>
                <RolesModulosPermisos />
              </MainLayout>
            </PrivateRoute>
          }
        />        
        <Route
          path="/accesorios"
          element={
            <PrivateRoute>
              <MainLayout>
                <Accesorios />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/accesorios/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <AccesorioDetalles />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categoria"
          element={
            <PrivateRoute>
              <MainLayout>
                <Categoria />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <MainLayout>
                <Productos />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/productos/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProductoDetalles />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bicicletas"
          element={
            <PrivateRoute>
              <MainLayout>
                <Bicicletas />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bicicletas/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <BicicletaDetalles />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/proveedor"
          element={
            <PrivateRoute>
              <MainLayout>
                <Proveedor />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/listacompra"
          element={
            <PrivateRoute>
              <MainLayout>
                <ListaCompra />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/compras/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <DetalleCompra />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/nueva-compra"
          element={
            <PrivateRoute>
              <MainLayout>
                <NuevaCompra />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <MainLayout>
                <Clientes />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/citas"
          element={
            <PrivateRoute>
              <MainLayout>
                <Citas />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Servicio"
          element={
            <PrivateRoute>
              <MainLayout>
                <Servicio />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/GestionCaja"
          element={
            <PrivateRoute>
              <MainLayout>
                <GestionCaja />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <PrivateRoute>
              <MainLayout>
                <Ventas />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/listaventas"
          element={
            <PrivateRoute>
              <MainLayout>
                <ListaVentas />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reembolsos/:id_venta"
          element={
            <PrivateRoute>
              <MainLayout>
                <Reembolsos />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reportesingresos"
          element={
            <PrivateRoute>
              <MainLayout>
                <ReportesIngresos />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reportesventas"
          element={
            <PrivateRoute>
              <MainLayout>
                <ReportesVentas/>
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/consultasventas"
          element={
            <PrivateRoute>
              <MainLayout>
                <ConsultaVentas />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/consultascompras"
          element={
            <PrivateRoute>
              <MainLayout>
                <ConsultaCompra />
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;