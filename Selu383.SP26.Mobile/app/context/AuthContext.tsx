import { createContext, useContext, useEffect, useState } from 'react';
import { api, type UserDto } from './api';

type AuthContextType = {
    user: UserDto | null;
    loading: boolean;
    login: (userName: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    setUser: (user: UserDto | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const refresh = async () => {
  const u = await api.auth.me().catch(() => null);
  setUser(u);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.auth.me()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (userName: string, password: string) => {
        const u = await api.auth.login({ userName, password });
        setUser(u);
    };

    const logout = async () => {
        await api.auth.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refresh, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
function setUser(u: UserDto | null) {
    throw new Error('Function not implemented.');
}

