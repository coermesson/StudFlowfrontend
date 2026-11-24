
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro('');
    setCarregando(true);

    try {
      await entrar(email, senha);
      navigate('/cursos');
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="pagina-login">

      <section className="painel-apresentacao">

        <Link to="/login" className="logo-login">
          StudyFlow<span>.</span>
        </Link>

        <div className="elementos-flutuantes" aria-hidden="true">

          <div className="icone-flutuante icone-kanban">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16M15 4v16" />
              <path d="M5.5 8h1.5M11 8h2M17 8h1" />
              <path d="M5.5 12h1.5M11 12h2" />
            </svg>
            <span>Kanban</span>
          </div>

          <div className="icone-flutuante icone-todo">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="m7 9 1.5 1.5L11 8" />
              <path d="M13 9h4" />
              <path d="m7 15 1.5 1.5L11 14" />
              <path d="M13 15h4" />
            </svg>
            <span>ToDo</span>
          </div>

          <div className="icone-flutuante icone-cursos">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="m2 8 10-5 10 5-10 5L2 8Z" />
              <path d="M6 10v5c3.5 3 8.5 3 12 0v-5" />
              <path d="M22 8v7" />
            </svg>
            <span>Cursos</span>
          </div>

          <div className="icone-flutuante icone-arquivos">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 5h6l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
              <path d="M2 10h20" />
            </svg>
            <span>Arquivos</span>
          </div>

        </div>

        <div className="apresentacao-texto">
          <span className="etiqueta-login">
            SEU ESPAÇO DE ESTUDOS
          </span>

          <h1>
            Organize suas ideias.
            <br />
            <span>Conquiste seus objetivos.</span>
          </h1>

          <p>
            Tudo o que você precisa para organizar sua rotina,
            acompanhar suas atividades e evoluir nos estudos.
          </p>
        </div>

        <span className="apresentacao-rodape">
          MENOS DESORGANIZAÇÃO. MAIS FOCO.
        </span>

      </section>

      <section className="painel-formulario">

        <form className="formulario-login" onSubmit={handleSubmit}>

          <div className="formulario-cabecalho">
            <span>ACESSO À PLATAFORMA</span>
            <h2>Bem-vindo de volta!</h2>
            <p>Entre na sua conta para continuar seus estudos.</p>
          </div>

          <div className="campos-login">

            <div className="campo-login">
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

            <div className="campo-login">
              <label htmlFor="senha">Senha</label>

              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                required
              />
            </div>

          </div>

          {erro && (
            <p className="mensagem-erro" role="alert">
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="texto-cadastro">
            <p>
              Ainda não possui uma conta?{' '}
              <Link to="/cadastro">Cadastre-se</Link>
            </p>
          </div>

        </form>

      </section>

    </main>
  );
}

export default Login;
