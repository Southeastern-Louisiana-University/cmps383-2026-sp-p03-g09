import { BrowserRouter as Router, Routes, Route, RouterProvider } from "react-router-dom";
import './App.css'
import Home from './Home.tsx'
import Menu from './Menu.tsx'
import theRouter from './Router.tsx'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
function App() {
    return <MantineProvider> 
        <Routes>
            <Route element={<NavBar />} />
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
        </Routes>
    </MantineProvider>
}

export default App
