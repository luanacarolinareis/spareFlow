import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './Login.jsx'
import ConfirmDelivery from './ConfirmDelivery'
import Technician from './Technician'
import Logistics from "./Logistics.jsx";

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/technician" element={<Technician />} />
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/confirm-delivery" element={<ConfirmDelivery />} />
            </Routes>
        </Router>
    );
}

export default App
