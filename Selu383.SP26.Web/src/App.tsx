import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './Home.tsx'
import Menu from './Menu.tsx'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

function App() {
  return <MantineProvider> 
      <Router>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
          </Routes>
      </Router>
    </MantineProvider>
}

export default App
