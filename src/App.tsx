import './App.css'
import './firebase.ts'
import Home from "./pages/home.tsx";
import {BrowserRouter, Route, Routes} from "react-router";
import Closet from "./pages/closet.tsx";

function App() {
    return (<><BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/closet" element={<Closet/>}/>
        </Routes>
    </BrowserRouter>
    </>)
}

export default App
