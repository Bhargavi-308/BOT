
import { useEffect, useState } from "react";
import { api } from "./api";
import AuthPage from "./components/AuthPage";
import ChatLayout from "./components/ChatLayout";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const currentUser = await api.me();
        setUser(currentUser);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setChecking(false);
      }
    };

    loadUser();
  }, []);

  if (checking) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <AuthPage
        onLoginSuccess={async () => {
          try {
            const currentUser = await api.me();
            setUser(currentUser);
          } catch {
            localStorage.removeItem("token");
            setUser(null);
          }
        }}
      />
    );
  }

  return (
    <ChatLayout
      user={user}
      onLogout={() => {
        localStorage.removeItem("token");
        setUser(null);
      }}
    />
  );
}
