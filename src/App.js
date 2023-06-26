import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [text, setText] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [refreshTokenValue, setRefreshTokenValue] = useState('');

    useEffect(() => {
        login();
    }, []);

    const login = () => {
        const loginData = {
            Email: 'levan.lashauri1@gmail.com',
            Password: 'Demo_1234',
        };

        axios
            .post('https://enagramm.com/API/Account/Login', loginData)
            .then(response => {
                const { AccessToken, RefreshToken } = response.data;
                setAccessToken(AccessToken);
                setRefreshTokenValue(RefreshToken);
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    };

    const refreshToken = () => {
        const refreshTokenData = {
            AccessToken: accessToken,
            RefreshToken: refreshTokenValue,
        };

        axios
            .post('https://enagramm.com/API/Account/RefreshToken', refreshTokenData)
            .then(response => {
                const { AccessToken, RefreshToken } = response.data;
                setAccessToken(AccessToken);
                setRefreshTokenValue(RefreshToken);
            })
            .catch(error => {
                console.error('Refresh token error:', error);
            });
    };

    const processText = text => {
        console.log('Processing text:', text);

        if (!accessToken) {
            console.error('Access token not available');
            return;
        }

        const sentences = splitTextIntoSentences(text);

        console.log('Sentences:', sentences);

        sentences.forEach(sentence => {
            const model = {
                Language: 'ka',
                Text: sentence,
                Voice: 0,
                IterationCount: 2,
            };

            axios
                .post('https://enagramm.com/API/TTS/SynthesizeTextAudioPath', model, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
                .then(response => {
                    const sourceUrl = response.data.AudioFilePath;
                    console.log('Audio source URL:', sourceUrl);
                })
                .catch(error => {
                    console.error('Text processing error:', error);
                    if (error.response && error.response.status === 401) {
                        refreshToken();
                    }
                });
        });
    };

    const splitTextIntoSentences = text => {
        const punctuationRegex = /[.!?:;\s]/;
        let sentences = [];
        let start = 0;

        for (let i = 0; i < text.length; i++) {
            if (punctuationRegex.test(text[i])) {
                const sentence = text.substring(start, i + 1).trim();
                sentences.push(sentence);
                start = i + 1;
            }
        }

        if (start < text.length) {
            const sentence = text.substring(start).trim();
            sentences.push(sentence);
        }

        return sentences;
    };

    const handleChange = event => {
        setText(event.target.value);
    };

    const handleSubmit = event => {
        event.preventDefault();
        processText(text);
    };
    console.log(text);
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea value={text} onChange={handleChange} />
                <button type="submit">Process Text</button>
            </form>
        </div>
    );
}

export default App;
