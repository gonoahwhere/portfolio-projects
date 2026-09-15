import React from 'react';
import ReactDOM from 'react-dom/client';
import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter } from 'react-router-dom';
import "./styles/tailwind.css";
import './styles/index.css';

import App from './App.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <HeroUIProvider class="dark">
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </HeroUIProvider>
);