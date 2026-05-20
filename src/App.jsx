import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Landing    from "./pages/Landing";
import Dashboard  from "./pages/Dashboard";
import History    from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import Badges     from "./pages/Badges";
import AIAdvisor  from "./pages/AIAdvisor";

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div style={{ minHeight: "100vh", background: "var(--ivory)" }}>
          <Navbar />
          <Routes>
            <Route path="/"             element={<Landing />}     />
            <Route path="/dashboard"    element={<Dashboard />}   />
            <Route path="/advisor"      element={<AIAdvisor />}   />
            <Route path="/history"      element={<History />}     />
            <Route path="/leaderboard"  element={<Leaderboard />} />
            <Route path="/badges"       element={<Badges />}      />
          </Routes>
        </div>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#1c1917",
              border: "1px solid var(--ivory-border)",
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(120,80,20,0.1)",
            },
            success: {
              iconTheme: { primary: "var(--emerald)", secondary: "#fff" },
            },
          }}
        />
      </BrowserRouter>
    </WalletProvider>
  );
}
