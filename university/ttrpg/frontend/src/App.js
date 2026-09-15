/* ===== IMPORTS ===== */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/* ===== STYLES ===== */
import './styles/App.css';

/* ===== FILES ===== */
import Background from './components/Background.js'
import Create from './components/Create.js'
import Read from './components/Read.js'
import Update from './components/Update.js'
import Delete from './components/Delete.js'
import Entry from './components/EntryPoint.js'
import ErrorPage from './components/404Page.js'

/* ===== DISPLAY ===== */
function App() {
    return (
        <div className="App-layout">
        <Background />
        <main className="App-header">
            <Routes>
                <Route path="/" element={<Entry />} />
                <Route path="/create" element={<Create />} />
                <Route path="/read" element={<Read />} />
                <Route path="/update" element={<Update />} />
                <Route path="/delete" element={<Delete />} />
                <Route path="*" element={<ErrorPage />} />
            </Routes>
        </main>
      </div>
    );
}

export default App;
