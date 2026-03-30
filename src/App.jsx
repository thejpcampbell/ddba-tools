import { useState } from "react";
import Hub from "./components/Hub.jsx";
import SetterLive from "./pages/SetterLive.jsx";
import CloserLive from "./pages/CloserLive.jsx";
import DmAssist from "./pages/DmAssist.jsx";

export default function App() {
  const [page, setPage] = useState("hub");
  const navigate = (p) => setPage(p);

  if (page === "setter-live") return <SetterLive onNavigate={navigate} />;
  if (page === "closer-live") return <CloserLive onNavigate={navigate} />;
  if (page === "dm-assist")   return <DmAssist   onNavigate={navigate} />;
  return <Hub onNavigate={navigate} />;
}
