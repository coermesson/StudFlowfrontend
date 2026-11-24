import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import noCoursesIllustration from '../../assets/illustrations/empty-states/no-courses.svg';
import EmptyState from '../../components/common/EmptyState/EmptyState';

import {
  atualizarCurso,
  cadastrarCurso,
  excluirCurso,
  getCursos,
} from '../../services/cursoService';
import {
  obterEstilosTema,
  obterTemaCurso,
} from '../../utils/temaEntidade';

import './Courses.css';

function obterChaveCurso(curso, indice) {
  if (curso && curso.id !== undefined && curso.id !== null) {
    return String(curso.id);
  }

  return `idx-${indice}`;
}

function Courses() {
  const navigate = useNavigate();

  const [cursos, setCursos] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [mostrarModalCurso, setMostrarModalCurso] = useState(false);
  const [nomeCurso, setNomeCurso] = useState('');
  const [salvandoCurso, setSalvandoCurso] = useState(false);
  const [cursoEditando, setCursoEditando] = useState(null);

  const [cursoParaExcluir, setCursoParaExcluir] = useState(null);
  const [excluindoCurso, setExcluindoCurso] = useState(false);

  useEffect(() => {
    async function carregarCursos() {
      try {
        setErro('');

        const dados = await getCursos();
        setCursos(dados || []);
      } catch (error) {
        setErro(error.message || 'Não foi possível carregar os cursos.');
      } finally {
        setCarregando(false);
      }
    }

    carregarCursos();
  }, []);

  async function atualizarListaCursos() {
    const cursosAtualizados = await getCursos();
    setCursos(cursosAtualizados || []);
  }

  function abrirCurso(curso) {
    navigate(`/cursos/${curso.id}`);
  }

  function abrirModalCurso(curso = null) {
    setCursoEditando(curso);
    setNomeCurso(curso ? curso.nome : '');
    setErro('');
    setMostrarModalCurso(true);
  }

  function fecharModalCurso() {
    if (salvandoCurso) return;

    setMostrarModalCurso(false);
    setNomeCurso('');
    setCursoEditando(null);
    setErro('');
  }

  async function handleSubmitCurso(event) {
    event.preventDefault();

    const nomeLimpo = nomeCurso.trim();

    if (!nomeLimpo) {
      setErro('Informe o nome do curso.');
      return;
    }

    setErro('');
    setSalvandoCurso(true);

    try {
      if (cursoEditando) {
        await atualizarCurso(cursoEditando.id, nomeLimpo);
      } else {
        await cadastrarCurso(nomeLimpo);
      }

      await atualizarListaCursos();

      setMostrarModalCurso(false);
      setNomeCurso('');
      setCursoEditando(null);
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o curso.');
    } finally {
      setSalvandoCurso(false);
    }
  }

  async function handleExcluirCurso() {
    if (!cursoParaExcluir) return;

    setErro('');
    setExcluindoCurso(true);

    try {
      await excluirCurso(cursoParaExcluir.id);
      await atualizarListaCursos();

      setCursoParaExcluir(null);
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir o curso.');
    } finally {
      setExcluindoCurso(false);
    }
  }

  function handleCardKeyDown(event, curso) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      abrirCurso(curso);
    }
  }

  const cursosFiltrados = cursos.filter((curso) =>
    curso.nome.toLowerCase().includes(pesquisa.trim().toLowerCase())
  );

  const huesUsados = [];

  return (
    <main className="courses-page">
      <header className="courses-header">
        <div className="courses-header-info">
          <div className="courses-title-row">
            <button
              type="button"
              className="courses-back-button"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              title="Voltar"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <h1>Cursos</h1>
          </div>

          <p>Organize seus cursos e materiais de estudo.</p>
        </div>

        <div className="courses-header-actions">
          {cursos.length > 0 && (
            <div className="courses-search">
              <input
                type="search"
                placeholder="Pesquisar cursos..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                aria-label="Pesquisar cursos"
              />
            </div>
          )}

          <button
            type="button"
            className="courses-add-button"
            onClick={() => abrirModalCurso()}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="courses-add-icon"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Adicionar curso</span>
          </button>
        </div>
      </header>

      <section className="courses-content">
        {carregando && (
          <p className="courses-message">Carregando cursos...</p>
        )}

        {!carregando && erro && (
          <p className="courses-error">{erro}</p>
        )}

        {!carregando && !erro && cursos.length === 0 && (
          <EmptyState
            illustration={noCoursesIllustration}
            title="Nenhum curso cadastrado"
            description="Adicione seu primeiro curso para começar a organizar seus estudos."
          />
        )}

        {!carregando && !erro && cursos.length > 0 && cursosFiltrados.length === 0 && (
          <EmptyState
            illustration={noCoursesIllustration}
            title="Nenhum curso encontrado"
            description="Não encontramos cursos com esse nome."
          />
        )}

        {!carregando && cursosFiltrados.length > 0 && (
          <div className="courses-list">
            {cursosFiltrados.map((curso, indice) => {
              const chave = obterChaveCurso(curso, indice);
              const tema = obterTemaCurso(curso?.id, huesUsados);

              if (typeof tema.hue === 'number') {
                huesUsados.push(tema.hue);
              }

              return (
                <article
                  className="course-card"
                  key={chave}
                  role="link"
                  tabIndex={0}
                  aria-label={`Abrir matérias do curso ${curso.nome}`}
                  onClick={() => abrirCurso(curso)}
                  onKeyDown={(event) => handleCardKeyDown(event, curso)}
                  style={obterEstilosTema(tema)}
                >
                  <h2>{curso.nome}</h2>

                  <div className="course-card-actions">
                    <button
                      type="button"
                      className="course-icon-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        abrirModalCurso(curso);
                      }}
                      aria-label={`Editar ${curso.nome}`}
                      title="Editar curso"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="course-icon-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setErro('');
                        setCursoParaExcluir(curso);
                      }}
                      aria-label={`Excluir ${curso.nome}`}
                      title="Excluir curso"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="m19 6-1 14H6L5 6" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {mostrarModalCurso && (
        <div
          className="course-modal-overlay"
          onClick={fecharModalCurso}
        >
          <section
            className="course-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="course-modal-title">
              {cursoEditando ? 'Editar curso' : 'Adicionar curso'}
            </h2>

            <p>
              {cursoEditando
                ? 'Altere o nome do curso.'
                : 'Informe o nome do curso que deseja cadastrar.'}
            </p>

            <form onSubmit={handleSubmitCurso}>
              <div className="course-form-field">
                <label htmlFor="course-name">Nome do curso</label>

                <input
                  id="course-name"
                  type="text"
                  value={nomeCurso}
                  onChange={(event) => setNomeCurso(event.target.value)}
                  placeholder="Digite o nome do curso"
                  required
                  autoFocus
                />
              </div>

              {erro && <p className="courses-error">{erro}</p>}

              <div className="course-modal-actions">
                <button
                  type="button"
                  className="course-cancel-button"
                  onClick={fecharModalCurso}
                  disabled={salvandoCurso}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="courses-add-button"
                  disabled={salvandoCurso}
                >
                  {salvandoCurso
                    ? 'Salvando...'
                    : cursoEditando
                      ? 'Salvar alterações'
                      : 'Salvar curso'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {cursoParaExcluir && (
        <div
          className="course-modal-overlay"
          onClick={() => {
            if (!excluindoCurso) setCursoParaExcluir(null);
          }}
        >
          <section
            className="course-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="course-delete-title"
            aria-describedby="course-delete-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="course-delete-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </svg>
            </div>

            <h2 id="course-delete-title">Excluir curso?</h2>

            <p id="course-delete-description">
              Tem certeza que deseja excluir o curso
              <strong> {cursoParaExcluir.nome}</strong>?
              Essa ação não poderá ser desfeita.
            </p>

            {erro && <p className="courses-error">{erro}</p>}

            <div className="course-modal-actions">
              <button
                type="button"
                className="course-cancel-button"
                onClick={() => setCursoParaExcluir(null)}
                disabled={excluindoCurso}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="course-delete-button"
                onClick={handleExcluirCurso}
                disabled={excluindoCurso}
              >
                {excluindoCurso ? 'Excluindo...' : 'Excluir curso'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Courses;