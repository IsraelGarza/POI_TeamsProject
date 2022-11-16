import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

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
    }

    const onMessageReceived = (payload)=>{
        var payloadData = JSON.parse(payload.body);
        console.log(payloadData);
        switch(payloadData.status){
            case "JOIN":
                if(!privateChats.get(payloadData.senderName)){
                    privateChats.set(payloadData.senderName,[]);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
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
    return (
    <div className="container-fluid">
        {userData.connected?
        <div className="row card-body d-flex">
            <div className="pt-4" id="mensajes-lista">
                <h4 className="text-white font-weight-bold">Lista de Mensajes      
                    <i className="fa-solid fa-pen-to-square mx-2 text-primary fa-fw" id="nuevo-mensaje"></i>
                </h4>
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
                            <input type="text" className="input-message form-control" placeholder="Ingresa un mensaje..." value={userData.message} onChange={handleMessage} /> 
                            <button type="button" className="btn btn-dark mx-2 px-4" onClick={sendValue}>Enviar</button>
                            <button type="button" className="btn btn-dark"><i className="fa-solid fa-paperclip"></i></button>
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
                            <button type="button" className="btn btn-dark"><i className="fa-solid fa-paperclip"></i></button>
                        </div>
                    </div>}
                    

                </div>
            </div>
            </div>
            :
            <div className="register">
                <input
                    id="user-name"
                    placeholder="Ingresa tu nombre..."
                    name="userName"
                    value={userData.username}
                    onChange={handleUsername}
                    margin="normal"
                  />
                  <button type="button" onClick={registerUser}>
                        Conectarse
                  </button> 
            </div>
        }
    </div>
    )
}

export default ChatRoom
