import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Usuario {
  id: number;
  nome: string;
  apelido: string;
  avatar: string;
  data_criacao: string;
  ultimo_acesso: string;
  total_pontos: number;
  visitas: number;
  conquistas?: any[];
  estatisticas?: any;
}

interface AuthContextData {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (apelido: string, senha: string) => Promise<void>;
  cadastro: (dados: { nome: string; apelido: string; senha: string; avatar: string }) => Promise<void>;
  logout: () => void;
  atualizarPerfil: () => Promise<void>;
  registrarAcao: (tipo: string, dados: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      const user = JSON.parse(usuarioSalvo);
      setUsuario(user);
      // Atualizar perfil com dados mais recentes
      atualizarPerfilSalvo(user.id);
    }
    setLoading(false);
  }, []);

  const atualizarPerfilSalvo = async (usuarioId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/perfil/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
        localStorage.setItem('usuario', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const login = async (apelido: string, senha: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apelido, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      setUsuario(data.usuario);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  };

  const cadastro = async (dados: { nome: string; apelido: string; senha: string; avatar: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      setUsuario(data.usuario);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao conectar com o servidor');
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const atualizarPerfil = async () => {
    if (!usuario) return;
    await atualizarPerfilSalvo(usuario.id);
  };

  const registrarAcao = async (tipo: string, dados: any) => {
    if (!usuario) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/registro-acao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: usuario.id,
          tipo,
          dados
        }),
      });

      const data = await response.json();

      if (response.ok && data.usuario) {
        setUsuario(data.usuario);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }
    } catch (error) {
      console.error('Erro ao registrar ação:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        loading,
        login,
        cadastro,
        logout,
        atualizarPerfil,
        registrarAcao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}