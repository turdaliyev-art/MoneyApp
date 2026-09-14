import { createContext, useContext, useEffect, useState } from "react";
import usersService from "../api/usersService";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("pn_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("pn_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pn_user");
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await usersService.login(credentials);
      const data = res.data;
      const token = data.token || data.accessToken;
      const loggedUser = data.user || data;
      if (token) localStorage.setItem("pn_token", token);
      setUser(loggedUser);
      toast.success("Xush kelibsiz! Tizimga muvaffaqiyatli kirdingiz.");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Backend server ishlamayapti. Avval moneyApp-backend papkasida npm start buyrug'ini ishga tushiring."
          : "Login yoki parol noto'g'ri. Qaytadan urinib ko'ring.");
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await usersService.register(payload);
      const data = res.data;
      const token = data.token || data.accessToken;
      const registeredUser = data.user || data;

      if (token) {
        localStorage.setItem("pn_token", token);
        setUser(registeredUser);
      } else {
        const loginRes = await usersService.login(payload);
        const loginData = loginRes.data;
        const loginToken = loginData.token || loginData.accessToken;
        const loggedUser = loginData.user || loginData;
        if (loginToken) localStorage.setItem("pn_token", loginToken);
        setUser(loggedUser);
      }

      toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz! Xush kelibsiz.");
      return { success: true, data: registeredUser };
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Backend server ishlamayapti. Avval moneyApp-backend papkasida npm start buyrug'ini ishga tushiring."
          : "Ro'yxatdan o'tishda xatolik yuz berdi.");
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pn_token");
    setUser(null);
    toast.info("Tizimdan chiqdingiz.");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
