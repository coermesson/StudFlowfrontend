
import { createContext, useContext, useEffect, useState } from 'react';
import {
  getUsuarioAutenticado,
  login as realizarLogin,
  logout as realizarLogout,
} from '../services/authService';
import { atualizarUsuario } from '../services/usuarioService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarSessao() {
      try {
        const dadosUsuario = await getUsuarioAutenticado();
        setUsuario(dadosUsuario);
      } catch {
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    }

    verificarSessao();
  }, []);

  async function entrar(email, senha) {
    const dadosUsuario = await realizarLogin(email, senha);
    setUsuario(dadosUsuario);
    return dadosUsuario;
  }

  async function sair() {
    await realizarLogout();
    setUsuario(null);
  }

  async function atualizarPerfil(dados) {
    const usuarioAtualizado = await atualizarUsuario(usuario.id, dados);
    setUsuario(usuarioAtualizado);
    return usuarioAtualizado;
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        entrar,
        sair,
        atualizarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
