import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from './Home.tsx'
import Menu from './Menu.tsx'
import Promos from './Promos.tsx'
import Stores from './Stores.tsx'
import NavBar from './NavBar.tsx'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './AuthContext.tsx';

function App() {
    return (
        <MantineProvider>
            <BrowserRouter>
                <AuthProvider>
                    <NavBar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/promos" element={<Promos />} />
                        <Route path="/stores" element={<Stores />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </MantineProvider>
    );
}

export default App
