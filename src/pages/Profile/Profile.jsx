
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

function Profile() {
  const { usuario, atualizarPerfil } = useAuth();

  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro('');
    setMensagem('');
    setCarregando(true);

    try {
      const dados = { nome, email };

      if (senha.trim() !== '') {
        dados.senha = senha;
      }

      await atualizarPerfil(dados);

      setSenha('');
      setMensagem('Perfil atualizado com sucesso!');
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="pagina-perfil">
      <div className="conteudo-perfil">
        <div className="cabecalho-perfil">
          <span>MINHA CONTA</span>
          <h1>Editar perfil</h1>
          <p>
            Gerencie suas informações pessoais e mantenha
            seus dados atualizados.
          </p>
        </div>

        <form className="formulario-perfil" onSubmit={handleSubmit}>
          <section className="secao-perfil">
            <div className="titulo-secao-perfil">
              <h2>Informações pessoais</h2>
              <p>Atualize seu nome e endereço de e-mail.</p>
            </div>

            <div className="campo-perfil">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite seu nome"
                autoComplete="name"
                required
              />
            </div>

            <div className="campo-perfil">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
                autoComplete="email"
                required
              />
            </div>
          </section>

          <section className="secao-perfil">
            <div className="titulo-secao-perfil">
              <h2>Alterar senha</h2>
              <p>
                Preencha somente se desejar cadastrar uma nova senha.
              </p>
            </div>

            <div className="campo-perfil">
              <label htmlFor="senha">Nova senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua nova senha"
                autoComplete="new-password"
              />
            </div>
          </section>

          {erro && (
            <p className="mensagem-perfil erro-perfil">{erro}</p>
          )}

          {mensagem && (
            <p className="mensagem-perfil sucesso-perfil">
              {mensagem}
            </p>
          )}

          <div className="acoes-perfil">
            <button type="submit" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Profile;
