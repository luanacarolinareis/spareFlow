import { useState } from 'react';
import './App.css';
import spareLogo from './assets/spare.png';
import { auth, db } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import medical from './assets/medical.jpg';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Novo estado para o nome
    const [userType, setUserType] = useState(''); // Novo estado para o tipo de utilizador
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook para navegação

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isRegistering) {
                // Registo
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Armazenar o tipo de utilizador no Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    name: name,
                    email: email,
                    userType: userType, // Salvar o tipo do utilizador
                });

                alert('Registo bem sucedido! Efetue login.');

                // Redirecionar para a página do tipo de utilizador após o registo
                if (userType === 'tecnico') {
                    navigate('/Technician'); // Página do técnico
                } else if (userType === 'logistica') {
                    navigate('/Logistics'); // Página da logística
                } else {
                    alert('Tipo de utilizador desconhecido.');
                }

                setIsRegistering(false);
            } else {
                // ‘Login’ do utilizador
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Buscar tipo do utilizador no Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();

                    // Redirecionamento com base no tipo de utilizador
                    if (data.userType === 'tecnico') {
                        navigate('/Technician'); // Página do técnico
                    } else if (data.userType === 'logistica') {
                        navigate('/Logistics'); // Página da logística
                    } else {
                        alert('Tipo de utilizador desconhecido.');
                    }
                } else {
                    alert('Erro: Tipo de utilizador não encontrado.');
                }
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container" style={{ medical: `url(${medical})` }}>
            <div className="login-box">
                <img src={spareLogo} alt="SpareFLOW Logo" className="app-logo" />
                <form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <div>
                            <input
                                type="text"
                                placeholder="Nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {isRegistering && (
                        <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'center' , width: '100%' }}>

                                <select style={{
                                    width: '80%',
                                    padding: '10px',
                                    textAlign: 'center', // Alinha o texto do select ao centro
                                    marginLeft: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px'
                                }} value={userType} onChange={(e) => setUserType(e.target.value)} required>
                                    <option value="" disabled>Escolha o tipo de utilizador</option>
                                    <option value="tecnico">Técnico</option>
                                    <option value="logistica">Logística</option>
                                </select>
                        </div>
                    )}
                    {error && <p className="error">{error}</p>}
                    <button type="submit">{isRegistering ? 'Registar' : 'Login'}</button>
                </form>
                <p>
                    {isRegistering ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                    <span className="toggle" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Faça login' : 'Registe-se'}
            </span>
                </p>
            </div>
        </div>
    );
}

export default Login;
