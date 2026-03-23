import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import StatusBar from "./components/StatusBar.jsx";
import Home from "./pages/Home.jsx";
import Apply from "./pages/Apply.jsx";
import Search from "./pages/Search.jsx";
import Policy from "./pages/Policy.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Contact from "./pages/Contact.jsx";

export default function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(() => localStorage.getItem("opoc_theme") === "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("opoc_theme", dark ? "dark" : "light");
  }, [dark]);

  const renderPage = () => {
    switch (page) {
      case "apply":         return <Apply />;
      case "search":        return <Search />;
      case "policy":        return <Policy />;
      case "subscriptions": return <Subscriptions />;
      case "contact":       return <Contact />;
      default:              return <Home setPage={setPage} />;
    }
  };

  return (
    <div className="app-root">
      <div className="bg-mesh" aria-hidden="true">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>
      <StatusBar />
      <Navbar page={page} setPage={setPage} dark={dark} setDark={setDark} />
      <main className="main-content">{renderPage()}</main>
      <Footer />
    </div>
  );
}
