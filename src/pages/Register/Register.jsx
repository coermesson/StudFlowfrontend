
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastrar } from '../../services/authService';
import './Register.css';


function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro('');
    setCarregando(true);

    try {
      await cadastrar(nome, email, senha);

      navigate('/login', {
        state: {
          mensagem: 'Cadastro realizado com sucesso! Faça seu login.',
        },
      });
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="pagina-cadastro">
      <section className="painel-apresentacao">
        <Link to="/login" className="logo-login">
          Study<span>Flow</span>
        </Link>

        <div className="elementos-flutuantes">
          <div className="icone-flutuante icone-kanban">
            <span>Kanban</span>
          </div>

          <div className="icone-flutuante icone-todo">
            <span>ToDo</span>
          </div>

          <div className="icone-flutuante icone-cursos">
            <span>Cursos</span>
          </div>

          <div className="icone-flutuante icone-arquivos">
            <span>Arquivos</span>
          </div>
        </div>

        <div className="apresentacao-texto">
          <span className="etiqueta-login">
            SUA ORGANIZAÇÃO COMEÇA AQUI
          </span>

          <h1>
            Organize seus estudos.
            <br />
            <span>Construa seu futuro.</span>
          </h1>

          <p>
            Crie sua conta e tenha em um só lugar as ferramentas
            necessárias para organizar sua rotina de estudos.
          </p>
        </div>

        <div className="apresentacao-rodape">
          STUDYFLOW • ORGANIZE SUA ROTINA
        </div>
      </section>

      <section className="painel-formulario">
        <form className="formulario-cadastro" onSubmit={handleSubmit}>
          <div className="formulario-cabecalho">
            <span>COMECE AGORA</span>
            <h2>Criar conta</h2>
            <p>Preencha seus dados para começar a usar o StudyFlow.</p>
          </div>

          <div className="campos-cadastro">
            <div className="campo-cadastro">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite seu nome"
                required
              />
            </div>

            <div className="campo-cadastro">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            <div className="campo-cadastro">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Crie uma senha"
                required
              />
            </div>
          </div>

          {erro && <p className="mensagem-erro">{erro}</p>}

          <button type="submit" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <div className="texto-cadastro">
            <p>
              Já possui uma conta? <Link to="/login">Entrar</Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Register;
