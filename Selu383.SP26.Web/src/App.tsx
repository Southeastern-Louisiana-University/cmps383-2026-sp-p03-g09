import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from './Home.tsx'
import Menu from './Menu.tsx'
import Promos from './Promos.tsx'
import Stores from './Stores.tsx'
import Cart from './Cart.tsx'
import Profile from './Profile.tsx'
import Rewards from './Rewards.tsx'
import Admin from './Admin.tsx'
import NavBar from './NavBar.tsx'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { createTheme, localStorageColorSchemeManager, MantineProvider } from '@mantine/core';

const colorSchemeManager = localStorageColorSchemeManager({ key: 'cl-color-scheme' });
import { AuthProvider } from './AuthContext.tsx';
import { CartProvider } from './CartContext.tsx';

const theme = createTheme({
    defaultRadius: 'md',
    fontFamily: "'Tiempos Text', serif",
    headings: {
        fontFamily: "'Tiempos Headline', serif",
    },
});

function App() {
    return (
        <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager} defaultColorScheme="dark">
            <BrowserRouter>
                <AuthProvider>
                    <CartProvider>
                        <NavBar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/promos" element={<Promos />} />
                            <Route path="/stores" element={<Stores />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/rewards" element={<Rewards />} />
                            <Route path="/admin" element={<Admin />} />
                        </Routes>
                    </CartProvider>
                </AuthProvider>
            </BrowserRouter>
        </MantineProvider>
    );
}

export default App
