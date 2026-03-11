import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('pedrosa_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('Logins')
                .select('*')
                .eq('user', username)
                .eq('senha', password)
                .single();

            if (error || !data) {
                return { success: false, message: 'Usuário ou senha incorretos' };
            }

            // Novo Mapeamento de Cargo:
            // analista -> analyst (quem aprova as notas)
            // admin -> admin (quem vê o fluxo e exporta excel)
            // engenheiro -> engineer (quem emite as notas)
            let appRole = 'engineer';
            const dbCargo = data.cargo?.toLowerCase();

            if (dbCargo === 'analista') {
                appRole = 'analyst';
            } else if (dbCargo === 'admin') {
                appRole = 'admin';
            }

            const userData = {
                id: data.id,
                username: data.user,
                name: data.user,
                role: appRole,
                cargoReal: data.cargo
            };

            setUser(userData);
            localStorage.setItem('pedrosa_user', JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            console.error('Critical login error:', err);
            return { success: false, message: 'Erro ao conectar ao servidor' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pedrosa_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
