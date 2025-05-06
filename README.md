# SpareFLOW

**Controlo de Rastreamento de Peças Adicionais para a Olympus Medical Products Portugal**

---

SpareFLOW é uma aplicação web desenvolvida para otimizar e centralizar o rastreamento de entregas de peças adicionais pedidas por técnicos no workshop da Olympus Medical Products Portugal. O sistema permite um controlo total do fluxo de peças, desde a receção do pedido pela logística até à confirmação de entrega na bancada do técnico, garantindo eficiência, transparência e rastreabilidade em tempo real.

---

## ✨ Funcionalidades Principais

- **Autenticação Segura**
  - Login e registo de utilizadores (técnicos e operadores de logística) via Firebase Authentication.
- **Gestão de Entregas**
  - Criação e registo de pedidos pela logística a partir da picking list.
  - Atualização do estado e localização dos pedidos ao longo do fluxo logístico.
- **Rastreamento em Tempo Real**
  - Pesquisa de pedidos por *Request ID*, *Order Number* ou *Spare Part*.
  - Visualização do estado e localização atual de cada pedido.
- **Confirmação de Entrega**
  - Técnicos registam a sua bancada ao entrar.
  - Confirmação da receção das peças apenas quando o pedido está no ponto de recolha correto.
- **Proteção e Validação de Dados**
  - Validação de inputs e feedback visual ao utilizador.
  - Registo de todas as operações para rastreamento completo.

---

## 🚀 Tecnologias Utilizadas

| Tecnologia     | Função                     |
| -------------- | ------------------------- |
| **React**      | Frontend (SPA)            |
| **Firebase**   | Autenticação & Firestore  |
| **JavaScript** | Lógica da aplicação       |
| **CSS/HTML**   | Interface e estilos       |

---

## 🛠️ Como Usar

1. **Clone o repositório:**
git clone https://github.com/luanacarolinareis/spareFlow.git
cd spareFlow

2. **Instale as dependências:**
npm install

4. **Configure o Firebase:**
- Crie um projeto no [Firebase](https://firebase.google.com/).
- Substitua as configurações em `src/firebase.js` com as suas credenciais.
  
4. **Inicie a aplicação:**
npm start

5. **Aceda via browser:**  
`http://localhost:3000`

---

## 🧩 Fluxo de Utilização

1. **Login:**  
Técnicos e logística efetuam login na aplicação.
2. **Registo de Pedido:**  
Logística regista novo pedido com *Request ID*, *Order Number* e *Spare Parts* (localização inicial: Picking).
3. **Atualização de Localização:**  
Logística atualiza a localização do pedido conforme o fluxo: Picking → Stock Out → Departamento correto.
4. **Confirmação pelo Técnico:**  
Técnico pesquisa o pedido, desloca-se ao ponto de recolha e confirma a entrega na sua bancada.

---

## 📋 Estrutura de Dados

- **Pedidos:**  
- Request ID  
- Order Number  
- Repair Type  
- Localização atual  
- Lista de Spare Parts  
- Timestamp

- **Utilizadores:**  
- Nome  
- Tipo (Técnico/Logística)  
- Bancada (para técnicos)

- **Localizações:**  
- Picking, Stock Out, Departamentos (Major, Middle, Minor, Surgical, Electronics), Bancadas

---

## 👥 Equipa

- Gabriela Mendoza (LEI)
- Henrique Malva (LEEC)
- Luana Carolina Reis (LEI)
- Martim Pegueiro (LEEC)

---

## 📄 Documentação & Demonstração

- [Relatório do Projeto (PDF)](https://github.com/luanacarolinareis/spareFlow/blob/master/Link%20N'%20Parse%20-%20Relat%C3%B3rio.pdf)
- [Pitch de Apresentação (PDF)](https://github.com/luanacarolinareis/spareFlow/blob/master/Link%20N%E2%80%99%20Parse%20-%20Pitch.pdf)
- [MVP Online](https://spareflow-reset.web.app/)

---

## 📢 Contribuição

Contribuições são bem-vindas!  
Abra uma *issue* ou envie um *pull request* para sugerir melhorias.

---

## 📬 Contacto

spareflow5@gmail.com

---

> **SpareFLOW - Eficiência, rastreabilidade e confiança no controlo de peças adicionais.**


