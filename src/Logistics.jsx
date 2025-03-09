import {useState, useEffect} from "react";
import spareLogo from "./assets/spare-bar.png";
import user from "./assets/user.png";
import "./App.css";
import gradient from "./assets/gradient.png"
import {doc, getDoc, addDoc, collection, onSnapshot, updateDoc, getDocs} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import {useNavigate} from "react-router-dom";
import * as url from "node:url";
import medical from "./assets/medical.jpg";

function Logistics() {
    const allowedRepairTypes = ["Major","Middle","Minor","Surgical","Electronics"];
    const allowedLocations = ["Major","Middle","Minor","Surgical","Electronics","Picking","Stock Out"];
    const [pickings, setPickings] = useState([])
    const [isAddWindOpen, setIsAddWindOpen] = useState(false);
    const [newReq,setNewReq] = useState({rID:'', oID:'', rType:'', loc:'picking', sParts:'', t:''})
    const [selectedReq, setSelectedReq] = useState(null);
    const [userName, setUserName] = useState("");
    const userId = auth.currentUser?.uid;
    const [searchValue, setSearchValue] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const navigate = useNavigate();

    // open and close add overlay
    const handleAddWind = () => {
        // open the window where logistics will add a new request
        setIsAddWindOpen(isAddWindOpen => !isAddWindOpen);
        setSelectedReq(null);
    }


    // when something changes in the input fields of add overlay update the auxiliar newReq
    const handleChange = (e) => {
        const {name , value} = e.target;
        setNewReq(prev => ({ ...prev, [name]: value }));
    }

    // submit the new request to the database
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!allowedRepairTypes.includes(newReq.rType)) {
            alert("Invalid repair type. Major, Middle, Minor, Surgical, Electronics");
            return; // Stop submission
        }
        try {
            newReq.t= new Date();
            const formattedReq = {
                rID: Number(newReq.rID),
                oID: Number(newReq.oID),
                rType: newReq.rType,
                loc: newReq.loc,
                sParts: newReq.sParts.split(',').map(Number), // Se os valores forem inseridos separados por vírgula
                timestamp: newReq.t
            };
            await addDoc(collection(db, "picking-lists"), formattedReq);
            setNewReq({ rID: '', oID: '', rType: '', loc: 'picking', sParts: '', t:'' });
            handleAddWind();
        } catch (error) {
            console.error("Erro ao adicionar pedido:", error);
        }
    };

    // open edit overlay
    const handleEditClick = (picking) => {
        setSelectedReq(picking);
        setIsAddWindOpen(false);
    };

    // alter state of the edited request
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedReq(prev => ({ ...prev, [name]: value }));
    };

    // save the edited request
    const handleSaveEdit = async () => {
        if (!selectedReq || !selectedReq.id) return;
        if (!allowedLocations.includes(selectedReq.loc)) {
            alert("Invalid Location. Major, Middle, Minor, Surgical, Electronics, Stock Out, Picking");
            return; // Stop submission
        }

        try {
            const requestRef = doc(db, "picking-lists", selectedReq.id);
            await updateDoc(requestRef, {
                loc: selectedReq.loc, // Atualiza apenas a localização
            });

            // Atualizar o estado local após salvar
            setPickings(prev =>
                prev.map(p => (p.id === selectedReq.id ? { ...p, loc: selectedReq.loc } : p))
            );

            setSelectedReq(null); // Fechar overlay
        } catch (error) {
            console.error("Erro ao adicionar pedido:", error);
        }
    };

    // Função para alternar a visibilidade do menu
    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    // Função para terminar a sessão
    const logout = async () => {
        try {
            if (userId) {
                // Atualizar o bench_Id do usuário para null no Firestore
                const userDocRef = doc(db, "users", userId);
                await updateDoc(userDocRef, {
                    bench_Id: null // Definir o benchId como null
                });

                // Fazer o logout
                await auth.signOut();

                // Redirecionar para a página de login
                navigate("/");
            }
        } catch (error) {
            console.error("Erro ao terminar a sessão:", error);
        }
    };

    // Ir pesquisar o nome do utilizador com sessão no Firestore
    useEffect(() => {
        const fetchUserName = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().name);
                    }
                } catch (error) {
                    console.error("Erro ao pesquisar nome de utilizador:", error);
                }
            }
        };
        fetchUserName();
    }, []);

    // Pesquisar pedidos do Firestore em tempo real
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "picking-lists"), (snapshot) => {
            const pickingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPickings(pickingsData);
        });

        return () => unsubscribe(); // Cleanup
    }, []);

    // Pesquisar ordens pelo número
    const fetchOrdersByOrderNr = async (searchVal) => {
        try {
            const ordersQuery = collection(db, "picking-lists");
            const querySnapshot = await getDocs(ordersQuery);

            const dbOrders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            let searchOrders = [];
            // pesquisar por rNr
            dbOrders.forEach((order) => {
                if(order.rID.toString().startsWith(searchVal) || searchVal.length === "") {
                    searchOrders.push(order);
                }
            });

            const sortedOrders = searchOrders.sort((a, b) => {
                return a.timestamp.seconds - b.timestamp.seconds;  //Mostrar o mais recente primeiro
            });

            console.log(sortedOrders);
            setPickings(sortedOrders);
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

    return (
        <div className="logistics-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div className="top-bar">
                <div className="logo-container">
                    <img src={spareLogo} alt="SpareFLOW Logo" className="top-logo" />
                    <span className="app-name">SpareFlow</span>

                </div>
                <div className="tech-user-container" style={{ width: "100%" }}>
                    <div style={{ marginRight: "15px",width:300 }} className="user-name">
                        {userName ? `Bem-vindo, ${userName}` : "<Sem sessão>"}
                    </div>
                </div>

                <div className="tech-user-container img">
                    <img  style={{ marginRight: "25px"}}
                        alt="User profile logo"
                        src={user}
                        className="top-logo"
                        onClick={toggleMenu} // Exibe o menu ao clicar
                    />
                </div>

                {menuVisible && (
                    <div className="user-menu">
                        <button
                            onClick={logout}
                            style={{
                                padding: "5px 10px",  // Reduzindo o espaço dentro do botão
                                fontSize: "0.8rem",   // Font menor
                                height: "90%",       // Altura pequena
                                width: "90%",       // Largura ajustada
                                backgroundColor: "#f44336",  // Cor de fundo do botão
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

            {/* Header */}
            <div className="logistics" style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center", // Centraliza verticalmente
                height: "60px", // Ajuste conforme a altura da barra
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",


            }}>
            </div>

            <div style={{ position: "fixed", display: "flex", top: "7.5%", left: "4.5%", alignItems: "center" }}>
                <div style={{ width:"300px", fontSize: "25px", fontWeight: "bold", marginTop: "50px"}}>
                    Pedidos Ativos
                </div>
                <input
                    type="text"
                    placeholder="Pesquisar por Request ID"
                    style={{
                        width: "400px",
                        height: "45px",
                        fontSize: "16px",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        outline: "none",
                        marginTop: "50px",
                        marginLeft:"20px",
                    }}
                    onChange={handleSearchChange}
                    onInput={handleSearchChange}
                />
                <button
                    style={{
                        height: '45px',
                        width: '45px',
                        position: "fixed",
                        top: "14.7%",
                        left: "52.7%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onClick={handleAddWind}
                >
                    +
                </button>
            </div>

            {/* Lista */}
            <ul className="request-list" style={{
                position: "fixed",
                top: "25%",
                left: "30%",
                transform: "translateX(-50%)",
                width: "50vw",
                height: "65vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
            }}>
                {pickings.map((picking) => (
                    <li
                        key={picking.id}
                        onClick={() => handleEditClick(picking)} style={{ padding: "10px", borderBottom: "1px solid #ccc", borderRadius: "10px", fontSize: "13px"}}
                        onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#50889f"; e.currentTarget.style.color = "#ffffff"}}
                        onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = ""}}>

                        <div className="request-item" >
                            <p><strong>Request ID:</strong> {picking.rID}</p>
                            <p><strong>Order ID:</strong> {picking.oID}</p>
                            <p><strong>Repair Type:</strong> {picking.rType}</p>
                            <p><strong>Location:</strong> {picking.loc}</p>
                            <p><strong>Spare Parts:</strong> {picking.sParts.join(", ")}</p>
                            <p><strong>Request Time:</strong> {new Date(picking.timestamp.seconds * 1000).toLocaleString()}</p>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Overlay para adicionar um novo request */}
            {isAddWindOpen && (
                <div style={{
                    borderRadius: "15px",
                    position: "fixed",
                    top: "37%",
                    left: "65%",
                    width: "25vw",
                    height: "50vh",
                    backgroundColor: "rgb(9, 53, 81)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}
                     onClick={handleAddWind}
                >
                    <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                        <input type="number" name="rID" value={newReq.rID} onChange={handleChange} required placeholder="Request ID" />
                        <input type="number" name="oID" value={newReq.oID} onChange={handleChange} required placeholder="Order ID" />
                        <input type="text" name="rType" value={newReq.rType} onChange={handleChange} required placeholder="Repair Type" />
                        <input type="text" name="sParts" value={newReq.sParts} onChange={handleChange} required placeholder="PartID,PartID..." />
                        <button type="submit" style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>Confirm</button>
                    </form>
                </div>
            )}

            {/* Overlay para alterar um request */}
            {selectedReq && (
                <div
                    style={{
                        borderRadius: "15px",
                        position: "fixed",
                        top: "43%",
                        left: "68%",
                        width: "20vw",
                        height: "30vh",
                        backgroundColor: "rgb(9, 53, 81)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setSelectedReq(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
                    >
                        <input
                            type="text"
                            name="loc"
                            value={selectedReq.loc}
                            onChange={handleEditChange}
                            placeholder="Location"
                            style={{ padding: "8px", width: "80%" }} // Optional: Adjust input width and padding
                        />
                        <button style={{ padding: "8px 12px" }} onClick={handleSaveEdit}>Save</button>
                        <button style={{ padding: "8px 12px" }} onClick={() => setSelectedReq(null)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Logistics;