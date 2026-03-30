import "./App.css";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div>Hi</div>
    </AuthProvider>
  );
}

export default App;
