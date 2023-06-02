import { useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'

const Sidebar = () => {

    const location = useLocation();
    console.log(location);
    
    return (
        <aside className="col-2 h-100">
            <img src={logo} alt="logo" className="img-fluid py-4"/>
           
            <ul>
                <li>
                    <a href="/" className={location.pathname === '/' ? 'active' : ''}>
                        <span className="mdi mdi-calendar-check">
                            <span className="texto">Agendamentos</span>
                        </span>
                    </a>
                </li>
                <li>
                    <a href="/clientes" className={location.pathname === '/clientes' ? 'active' : ''}>
                        <span className="mdi mdi-account-multiple">
                            <span className="texto">Clientes</span>
                        </span>
                    </a>
                </li>
            </ul>






        </aside>
    
    
    );
};

export default Sidebar;

