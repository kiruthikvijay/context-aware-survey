import React, { useEffect, useState } from 'react';

const ChatGPT = ({name}) => {
  const [responseSurvey, setResponseSurvey] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([{
    role: 'system',
    content: 'You are a helpful assistant.',
  },
  {
    role: 'user',
    content: '',
  },]);

  const api_key = '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'; // Replace with your actual API key
  const apiEndpoint = '/api/save-response';

  const handleSubmit = async () => {
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api_key}`,
    };

    const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: `generate 2 survey questions ${name}`
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result);
      
      
      const botResponse = { content: result.choices[0].message.content, role: 'system' };
      setMessages([...messages, botResponse]);
      setResponseSurvey(result.choices[0].message.content);
      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleButton = async () => {
    const newMessage = { content: inputText, role: 'user' };
    setMessages([...messages, newMessage]);
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api_key}`,
    };

    const data = {
      model: 'gpt-3.5-turbo',

        // {
        //   role: 'system',
        //   content: 'You are a helpful assistant.',
        // },
        // {
        //   role: 'user',
        //   content: `${inputText}`,
        // },
        
      messages: [...messages, newMessage],
      
      max_tokens: 50,
      temperature: 0.7,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(response.toString());
      console.log(response);
      console.log(result);
      console.log(result.toString);
      const botResponse = { content: result.choices[0].message.content, role: 'system' };
      setMessages([...messages, botResponse]);
      setResponseSurvey(result.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  return (
    <div>
      <div>
        <h2>Response Survey:</h2>

        <div style={{ maxHeight: '5em', overflowY: 'auto' }}>
        
        <p >{responseSurvey}</p>
      </div>
        <label>
          Enter Response:
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </label>
<button onClick={handleButton}>Submit</button>
      </div>
    </div>
  );
};

export default ChatGPT;