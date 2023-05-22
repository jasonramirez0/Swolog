import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserContextProvider } from './UserContext'
import { ErrorMessageContextProvider } from './ErrorMessageContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
    <UserContextProvider>
        <ErrorMessageContextProvider>
            <App />
        </ErrorMessageContextProvider>
    </UserContextProvider>
)
