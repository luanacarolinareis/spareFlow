import React, {useState} from 'react';
import './divlist.css';
import {doc, updateDoc} from "firebase/firestore";
import {db} from "./firebaseConfig.js";  // Import the CSS file for styling

const OrderList = ({ orders, benchID }) => {  // Accept orders as a prop

    const [confMenu, setConfMenu] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Click handler for the "View Details" button
    const handleButtonClick = (order) => {
        setSelectedOrder(order);
        setConfMenu(!confMenu);
    };

    const handleConfirm = async () => {

        try {
            const requestRef = doc(db, "picking-lists", selectedOrder.id);
            await updateDoc(requestRef, {
                loc: benchID  // Atualiza apenas a localização
            });

        } catch (error) {
            console.error("Erro ao adicionar pedido:", error);
        }
    };

    return (
        <div>
            <div id="scroll-container">
                {orders.map((order) => (
                    <div key={order.id} className="list-item">
                        <div className="list-item-header">Order {order.oID}</div>
                        <div className="list-item-text">
                            Order ID: {order.oID}, Location: {order.loc}, Request ID: {order.rID}
                        </div>
                        <button
                            className="list-item-button"
                            onClick={() => handleButtonClick(order)}
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Overlay para adicionar um novo request */}
            {confMenu && (
                <div className="login-container" style={{
                    borderRadius: "15px",
                    position: "fixed",
                    top: "27%",
                    left: "35%",
                    width: "30vw",
                    height: "50vh",
                    backgroundColor: "rgb(9,51,83)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <h1 style={{ fontSize: '1.5em' }}>Confirmação de Entrega</h1>
                    <button onClick={handleConfirm}>Confirmar Entrega</button>
                </div>
            )}
        </div>
    );
}

export default OrderList;
