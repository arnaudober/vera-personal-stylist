import "./App.css";
import "./firebase.ts";
import { SuggestPage } from "./pages/suggest-page.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { ClosetPage } from "./pages/closet-page.tsx";

function App() {
  return (
    <div className="bg-app min-h-screen flex flex-col">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SuggestPage />} />
          <Route path="/closet" element={<ClosetPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
