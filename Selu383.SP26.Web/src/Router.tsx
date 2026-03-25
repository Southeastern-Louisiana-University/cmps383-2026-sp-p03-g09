import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './Home.tsx'
import Menu from './Menu.tsx'
import NavBar from './NavBar.tsx'
function theRouter() {
    return (
      <BrowserRouter>
      <Routes>
          <Route element={<NavBar />} />
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
      </Routes>
          </BrowserRouter>
  );
}

export default theRouter;