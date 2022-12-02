import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var tablaMsg = [
    { usuario: "", mensaje: ""},
];

var encriptarMsg;

var stompClient = null;
const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); 
    const [tab,setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receiverName: '',
        connected: false,
        message: ''
      });
    useEffect(() => {
      console.log(userData);
    }, [userData]);

    const connect =()=>{
        let Sock = new SockJS('http://localhost:8080/ws');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/'+userData.username+'/private', onPrivateMessage);
        userJoin();
    }

    const userJoin=()=>{
          var chatMessage = {
            senderName: userData.username,
            status:"JOIN"
          };
          stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
          //var text = document.getElementById('input-msg');
          //text.value += ' after clicking';
          //document.getElementById("input-msg").value = chatMessage;
          console.log('SISTEMA: Ha iniciado sesión ' + chatMessage.senderName);
    }

    const onMessageReceived = (payload)=>{
        var payloadData = JSON.parse(payload.body);
        console.log(payloadData);
        switch(payloadData.status){
            case "JOIN":
                if(!privateChats.get(payloadData.senderName)){
                    privateChats.set(payloadData.senderName,[]);
                    setPrivateChats(new Map(privateChats));
                }console.log('SISTEMA: Ha iniciado sesión ' + payloadData.senderName);
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                if (payloadData.senderName != userData.username) {
                    console.log(payloadData.senderName + "!=" + userData.username);
                    var nuevoMensaje = {usuario: payloadData.senderName, mensaje: payloadData.message};
                    tablaMsg.push(nuevoMensaje);
                    console.log(tablaMsg);
                }
                break;
        }
        
    }
    
    const onPrivateMessage = (payload)=>{
        console.log(payload);
        var payloadData = JSON.parse(payload.body);
        if(privateChats.get(payloadData.senderName)){
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        }else{
            let list =[];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log(err);
        
    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }

    const sendValue=()=>{
        if (stompClient) {
          var chatMessage = {
            senderName: userData.username,
            message: userData.message,
            status:"MESSAGE"
          };
          console.log(chatMessage);
          stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
          setUserData({...userData,"message": ""});
        }
        var nuevoMensaje = {usuario: userData.username, mensaje: userData.message};
        tablaMsg.push(nuevoMensaje);
        console.log(tablaMsg);
    }

    const sendPrivateValue=()=>{
        if (stompClient) {
          var chatMessage = {
            senderName: userData.username,
            receiverName:tab,
            message: userData.message,
            status:"MESSAGE"
          };
          
          if(userData.username !== tab){
            privateChats.get(tab).push(chatMessage);
            setPrivateChats(new Map(privateChats));
          }
          stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
          setUserData({...userData,"message": ""});
        }
    }

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    const registerUser=()=>{
        connect();
    }

    function changeStatus() 
    {
        var statusBtn = document.getElementById("status");
        if (statusBtn.value=="Conectado") statusBtn.value = "Desconectado";
        else statusBtn.value = "Conectado";
        if ( statusBtn.classList.contains('btn-success') ) statusBtn.classList.toggle('btn-danger');
        else statusBtn.classList.toggle('btn-success');
        setUserData({...userData,"connected": false});
        console.log(userData);
        window.location.reload();
    }

    function saveConversation()
    {
        alert('La conversación ha sido guardada.\n'+ JSON.stringify(tablaMsg));
        //var fs = require('fs');
        //var file = fs.createWriteStream('conversacion-'+userData.username+'.txt');
        //file.on('error', function(err) { console.log("Error al abrir el archivo."); });
        //tablaMsg.forEach(function(v) { file.write(v.join(', ') + '\n'); });
        //file.end();
    }

    return (
    <div className="container-fluid">
        {userData.connected?
        <div className="row card-body d-flex">
            <div className="pt-4" id="mensajes-lista">
                <h3 className="text-white font-weight-bold ms-5">Lista de Mensajes de {userData.username}
                </h3>
                
                <div className="chat-box">
                    <div className="member-list">
                        
                        <h5 className="text-white pb-2 mt-0" id="titulo-mensajes">Mis Contactos</h5>
                        <ul>
                            <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chat Global</li>
                            {[...privateChats.keys()].map((name,index)=>{
                                return <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>}
                            )}
                        </ul>
                    </div>


                    {tab==="CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages mensajes-container pt-5">
                            {publicChats.map((chat,index)=>{
                                return <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                        })}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message form-control" id="input-msg" placeholder="Ingresa un mensaje..." value={userData.message} onChange={handleMessage} /> 
                            <button type="button" className="btn btn-dark mx-2 px-4" onClick={sendValue}>Enviar</button>
                            <button type="button" className="btn btn-dark"><i className="fa-solid fa-paperclip"></i></button>
                            <input type="button" className="btn btn-success mx-2" onClick={changeStatus} id="status" value="Conectado"/>
                        </div>
                    </div>}


                    {tab!=="CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages mensajes-container pt-5">
                            {[...privateChats.get(tab)].map((chat,index)=>{
                                return <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                        })}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message form-control" placeholder="Ingresa un mensaje privado..." value={userData.message} onChange={handleMessage} /> 
                            <button type="button" className="btn btn-dark mx-2 px-4" onClick={sendPrivateValue}>Enviar</button>
                            <button type="button" className="btn btn-dark mx-1"><i className="fa-solid fa-paperclip"></i></button>
                            <button type="button" className="btn btn-success mx-2" onClick={changeStatus} id="status">Conectado</button>
                        </div>
                    </div>}
                    

                </div>
                <button type="button" className="btn btn-dark mx-2 px-4" onClick={saveConversation}>Guardar Conversación</button>
                
            </div>
            </div>
            :
            <div className="register">
                  <div className="row d-flex justify-content-center align-items-center">
                    <div className="card rounded-3 text-white bg-dark">
                      <div className="card-body p-md-5 mx-md-4">
                        <div className="text-center">
                          <h3 className="mb-5">Bienvenido a Teams<span className="text-warning"> 2</span></h3>
                        </div>
                        <div className="form-outline mb-4">
                          <label className="form-label" htmlFor="user-name">Nombre de Usuario: </label>
                          <input id="user-name" name="userName" className="form-control" value={userData.username} onChange={handleUsername} required/>
                        </div>
                        <div className="form-outline">
                          <label className="form-label" htmlFor="loginPass">Contraseña: </label>
                          <input type="password" id="loginPass" name="loginPass" className="form-control"/>
                        </div>
                        <div className="text-center">
                          <button className="btn btn-block accent-bg-color mt-5 px-3" type="button" onClick={registerUser}>Iniciar Sesión</button>
                        </div>
                      </div>
                    </div>
                  </div>
            </div>
        }
    </div>
    )
}

export default ChatRoom
