import { useState } from 'react';
import { sendMessage, isTyping } from 'react-chat-engine';
import { SendOutlined, PictureOutlined } from '@ant-design/icons';

const MessageForm = (props) => {
    const [value, setValue] = useState('');
    const { chatId, creds } = props;

    const handleSubmit = (event) => {
        event.preventDefault();

        const text = value.trim();

        if(text.length > 0) sendMessage(creds, chatId, { text });

        setValue('');
    }

    const handleChange = (event) => {
        setValue(event.target.value);

        isTyping(props, chatId);
    }

    const handleUpload = (event) => {
        sendMessage(creds, chatId, { files: event.target.files, text: '' });
    }

    const encryptMessage = (event) => {
        var x = document.getElementById("messageId").innerText;
        console.log(x);
        //var elms = document.querySelectorAll("[id='messageId']");
 
        //for(var i = 0; i < x.length; i++) 
        //    console.log(x[i]);
    }

    const UnEncryptMessage = (event) => {
        var y = document.getElementById("messageId").value;

        console.log(y);
    }

    return (
        <form className="message-form" onSubmit={handleSubmit}>
            <input
                className="message-input"
                placeholder="Enviar un mensaje..."
                value={value}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
            <label htmlFor='upload-button'>
                <span className='image-button'>
                    <PictureOutlined className='picture-icon'/>
                </span>
            </label>
            <input
                type="file" 
                multiple={false} 
                id="upload-button"
                style={{ display: 'none' }}
                onChange={handleUpload}
            />
            <button type='submit' className='send-button'>
                <SendOutlined className='send-icon' />
            </button>

            <button type='button' className='encbtn' onClick={encryptMessage}>Encriptar</button>

            <button type='button' className='encbtn' onClick={UnEncryptMessage}>Desencriptar</button>
        </form>
    );
}

export default MessageForm;