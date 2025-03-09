import { useState } from "react";
import './App.css';

function ConfirmDelivery() {
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        setTimeout(() => {
            setConfirmed(true);
        }, 1000);
    };

    return (
        <div className="login-container">
            <h1 style={{ fontSize: '1.5em' }}>Confirmação de Entrega</h1>
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {confirmed ? (
                    <p className="confirm-message">Entrega confirmada! Obrigado.</p>
                ) : (
                    <button onClick={handleConfirm}>Confirmar Entrega</button>
                )}
            </div>
        </div>
    );
}

export default ConfirmDelivery;


