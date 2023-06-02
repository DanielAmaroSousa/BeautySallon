import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles.css';
import Header from "./components/header/index";
import Sidebar from "./components/sidebar/index";
import Agendamentos from './pages/Agendamentos/index';
import Clientes from './pages/Clientes/index';


const WebRoutes = () => {

    
    return (
        <>
            <Header />
            <div className="container-fluid h-100">
                <div className="row h-100">
                    <Router>
                        <Sidebar/>            
                        <Routes>
                                    <Route path="/" element={<Agendamentos />} />
                                    <Route path="/clientes" element={<Clientes />} />
                        </Routes>

                </Router>
                </div>
            </div>
                        
                
        </>  
    );

};

export default WebRoutes;