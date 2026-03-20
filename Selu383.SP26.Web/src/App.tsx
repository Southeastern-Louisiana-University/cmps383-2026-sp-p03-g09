import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from './Home.tsx'
import Menu from './Menu.tsx'
import NavBar from './NavBar.tsx'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

function App() {
    return (
        <MantineProvider>
            <BrowserRouter>
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/menu" element={<Menu />} />
                </Routes>
            </BrowserRouter>
        </MantineProvider>
    );
}

export default App
