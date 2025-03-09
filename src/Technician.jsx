import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./divlist.css";
import spareLogo from "./assets/spare-bar.png";
import user from "./assets/user.png";

function Technician() {
    const [searchValue, setSearchValue] = useState("");
    const [userName, setUserName] = useState("");
    const [orders, setOrders] = useState([]);
    const [benchId, setBenchId] = useState("");
    const [benchIdStatus, setBenchIdStatus] = useState("");
    const [benchIdOk, setBenchIdOk] = useState(false);
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    const [filterOption, setFilterOption] = useState("meus");
    const [menuVisible, setMenuVisible] = useState(false);
    const navigate = useNavigate();
    const [isValidBenchId, setIsValidBenchId] = useState(false);
    const [confMenu, setConfMenu] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);


    // Pesquisar o nome do utilizador com sessão no Firestore
    useEffect(() => {
        const fetchUserName = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().name);
                    }
                } catch (error) {
                    console.error("Erro ao encontrar nome do utilizador:", error);
                }
            }
        };
        fetchUserName();
    }, []);

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    // Função para terminar sessão
    const logout = async () => {
        try {
            if (userId) {
                // Atualizar o bench_Id do utilizador para null
                const userDocRef = doc(db, "users", userId);
                await updateDoc(userDocRef, {
                    bench_Id: null
                });

                // Fazer o logout
                await auth.signOut();

                // Redirecionar para a página iniciar
                navigate("/");
            }
        } catch (error) {
            console.error("Erro ao terminar a sessão:", error);
        }
    };


    // Pesquisar ordens pelo número
    const fetchOrdersByOrderNr = async (searchVal) => {
        try {
            const ordersQuery = collection(db, "picking-lists");
            const querySnapshot = await getDocs(ordersQuery);

            const dbOrders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            //console.log(searchVal);
            let searchOrders = [];
            dbOrders.forEach((order) => {
                let match = false;

                // pesquisar por orderNr
                if(order.oID.toString().startsWith(searchVal) || searchVal.length === "") {
                    match = true;
                }

                //pesquisar por sparePartsIds
                if(!match){
                    order.sParts.forEach((part) =>  {
                        if(("#" + part.toString()).startsWith(searchVal)){
                            match = true;
                        }
                    });
                }

                if(match){
                    searchOrders.push(order);
                }
            });

            const sortedOrders = searchOrders.sort((a, b) => {
                return a.timestamp.seconds - b.timestamp.seconds;  //Mostrar o mais recente primeiro
            });

            //console.log(sortedOrders);
            setOrders(sortedOrders);
        } catch (error) {
            console.log("Erro ao procurar ordens:", error);
        }
    };

    // Atualizar valor da pesquisa
    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);
        fetchOrdersByOrderNr(value);

    };

    const handleBenchIdChange = (e) => {
        setBenchId(e.target.value);
    };

    const checkBenchId = async (id, userId) => {
        // Verifica se o ID contém apenas números
        if (!/^\d+$/.test(id)) {
            setBenchIdStatus({ message: "ID inválido", color: "red" });
            setBenchIdOk(false);
            return;
        }

        try {
            const benchDocRef = doc(db, "bench-ids", id.toString());
            const benchDocSnap = await getDoc(benchDocRef);

            if (benchDocSnap.exists()) {
                setBenchIdStatus({ message: "ID Válido", color: "green" });
                setBenchIdOk(true);
                // Atualiza o campo 'bench_Id' do utilizador
                const userDocRef = doc(db, "users", userId);
                await updateDoc(userDocRef, {
                    bench_Id: id.toString()
                });

            } else {
                setBenchIdStatus({ message: "ID não encontrado", color: "red" });
                setBenchIdOk(false);
            }
        } catch (error) {
            console.error("Erro ao verificar o ID da bancada:", error);
            setBenchIdStatus({ message: "Erro na verificação do ID", color: "red" });
            setBenchIdOk(false);
        }
    };

    const handleBenchUnfocus = (e) => {
        checkBenchId(benchId, userId);
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            checkBenchId(benchId, userId);
        }
    };

    const handleFilterChange = (e) => {
        setFilterOption(e.target.value);
        handleSearchChange();
    };

    // Click handler for the "View Details" button
    const handleButtonClick = (order) => {
        setSelectedOrder(order);
        setConfMenu(!confMenu && benchIdOk);
    };

    const handleConfirm = async () => {

        try {
            const requestRef = doc(db, "picking-lists", selectedOrder.id);
            await updateDoc(requestRef, {
                loc: benchId  // Atualiza apenas a localização
            });
            setConfMenu(false);
            fetchOrdersByOrderNr(); //Atualizar a lista


        } catch (error) {
            console.error("Erro ao adicionar pedido:", error);
        }
    };

    return (


        <div className="technician-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div className="top-bar">
                <div className="logo-container">
                    <img src={spareLogo} alt="SpareFLOW Logo" className="top-logo" />
                    <span className="app-name">SpareFlow</span>
                </div>
                <div className="tech-user-container" style={{marginRight: "40px"}}>
                    <input
                        type="text"
                        placeholder="ID da Bancada"
                        className="bench-id-input"
                        value={benchId} onChange={handleBenchIdChange}
                        onBlur={handleBenchUnfocus}
                        onKeyDown={handleKeyPress}
                        style={{
                            height: "90%",
                            width: "36%",
                            fontSize: "0.8rem",
                            backgroundColor: "rgba(16,37,90,0.65)",
                            color: "white"
                        }}
                    />

                    <div className="user-name">
                        {userName ? `Bem-vindo, ${userName}` : "<Sem sessão>"}
                    </div>

                    <div className="bench-id-status" style={{ marginLeft: "15px", color: benchIdStatus.color }}>
                        {benchIdStatus.message}
                    </div>

                    <img
                        alt="User profile logo"
                        src={user}
                        className="top-logo"
                        onClick={toggleMenu} // Exibe o menu ao clicar
                    />

                    {menuVisible && (
                        <div className="user-menu">
                            <button
                                onClick={logout}
                                style={{
                                    padding: "5px 10px",  // Reduz o espaço dentro do botão
                                    fontSize: "0.8rem",   // Font menor
                                    height: "90%",       // Altura pequena
                                    width: "90%",       // Largura ajustada
                                    backgroundColor: "#f44336",  // Cor do fundo do botão
                                    color: "white",       // Cor do texto
                                    border: "none",       // Sem borda
                                    borderRadius: "5px",  // Borda arredondada
                                    cursor: "pointer"     // Cursor como pointer
                                }}
                            >
                                Terminar Sessão
                            </button>
                        </div>
                    )}
                </div>
            </div>





            <div style={{ position: "fixed", display: "flex", top: "7.5%", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Pesquisar por Order Number (#<num>) ou Spare Part ID"
                    style={{
                        width: "390px",
                        height: "45px",
                        fontSize: "16px",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        outline: "none",
                        marginTop: "50px",
                    }}
                    onChange={handleSearchChange}
                    onInput={handleSearchChange}
                />
            </div>

            {/* Lista */}
            <ul className="request-list" style={{
                position: "fixed",
                top: "22%",
                width: "50vw",
                height: "65vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
            }}>
                {orders.map((picking) => (
                    <li
                        key={picking.id}
                        onClick={() => handleButtonClick(picking)} style={{ padding: "10px", borderBottom: "1px solid #ccc", borderRadius: "10px" }}
                        onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#50889f"; e.currentTarget.style.color = "#ffffff"}}
                        onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = ""}}>

                        <div className="request-item" >
                            <p><strong>Order ID:</strong> {picking.oID}</p>
                            <p><strong>Repair Type:</strong> {picking.rType}</p>
                            <p><strong>Location:</strong> {picking.loc}</p>
                            <p><strong>Spare Parts:</strong> {picking.sParts.join(", ")}</p>
                            <p><strong>Request Time:</strong> {new Date(picking.timestamp.seconds * 1000).toLocaleString()}</p>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Overlay para confirmar a entrega */}
            {confMenu && (
                <div className="login-container" style={{
                    borderRadius: "15px",
                   top: "27%",
                    width: "30vw",
                    height: "50vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundImage: "/assets/gradient.png",
                    zIndex: 1000
                }}>
                    <h1 style={{ fontSize: '1.5em' }}>Confirmação de Entrega</h1>
                    <button onClick={handleConfirm}>Confirmar Entrega</button>
                </div>
            )}


        </div>




                    

    );
}

export default Technician;