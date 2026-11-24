import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import EmptyState from '../../components/common/EmptyState/EmptyState';

import noSubjectsIllustration from '../../assets/illustrations/empty-states/no-subjects.svg';

import {
  atualizarMateria,
  cadastrarMateria,
  excluirMateria,
  getMaterias,
} from '../../services/materiaService';

import { getCursos } from '../../services/cursoService';
import { obterEstilosTema, obterTemaMateria } from '../../utils/temaEntidade';

import './SubjectsList.css';

function SubjectsList() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [pesquisa, setPesquisa] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [nomeMateria, setNomeMateria] = useState('');
  const [materiaEditando, setMateriaEditando] = useState(null);
  const [materiaParaExcluir, setMateriaParaExcluir] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    setCarregando(true);
    setErro('');

    try {
      const [cursos, todasMaterias] = await Promise.all([
        getCursos(),
        getMaterias(),
      ]);

      const cursoEncontrado = (cursos || []).find(
        (item) => String(item.id) === String(id)
      );

      if (!cursoEncontrado) {
        setErro('Curso não encontrado.');
        setCurso(null);
        setMaterias([]);
        return;
      }

      const materiasDoCurso = (todasMaterias || []).filter(
        (materia) => String(materia.cursoId) === String(id)
      );

      setCurso(cursoEncontrado);
      setMaterias(materiasDoCurso);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar as matérias.');
    } finally {
      setCarregando(false);
    }
  }

  function abrirCadastro() {
    setNomeMateria('');
    setMateriaEditando(null);
    setErro('');
    setMostrarModal(true);
  }

  function abrirEdicao(event, materia) {
    event.stopPropagation();

    setNomeMateria(materia.nome);
    setMateriaEditando(materia);
    setErro('');
    setMostrarModal(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nomeLimpo = nomeMateria.trim();

    if (!nomeLimpo) {
      setErro('Informe o nome da matéria.');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      if (materiaEditando) {
        await atualizarMateria(materiaEditando.id, nomeLimpo);
      } else {
        await cadastrarMateria(nomeLimpo, curso.id);
      }

      await carregarMaterias();

      setMostrarModal(false);
      setNomeMateria('');
      setMateriaEditando(null);
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar a matéria.');
    } finally {
      setSalvando(false);
    }
  }

  async function carregarMaterias() {
    const dados = await getMaterias();

    const materiasDoCurso = (dados || []).filter(
      (materia) => String(materia.cursoId) === String(id)
    );

    setMaterias(materiasDoCurso);
  }

  async function confirmarExclusao() {
    if (!materiaParaExcluir) return;

    setErro('');

    try {
      await excluirMateria(materiaParaExcluir.id);
      await carregarMaterias();
      setMateriaParaExcluir(null);
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a matéria.');
      setMateriaParaExcluir(null);
    }
  }

  function abrirMateria(materiaId) {
    navigate(`/materias/${materiaId}`);
  }

  function handleCardKeyDown(event, materiaId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      abrirMateria(materiaId);
    }
  }

  const materiasFiltradas = materias.filter((materia) =>
    materia.nome.toLowerCase().includes(pesquisa.trim().toLowerCase())
  );

  if (carregando) {
    return (
      <main className="subjects-page">
        <p className="subjects-message">Carregando matérias...</p>
      </main>
    );
  }

  if (!curso) {
    return (
      <main className="subjects-page">
        <header className="subjects-header">
          <div className="subjects-heading">
            <div className="subjects-title-row">
              <button
                type="button"
                className="subjects-back-button"
                onClick={() => navigate('/cursos')}
                aria-label="Voltar para cursos"
                title="Voltar para cursos"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </button>

              <h1>Matérias</h1>
            </div>
          </div>
        </header>

        <p className="subjects-error">
          {erro || 'Curso não encontrado.'}
        </p>
      </main>
    );
  }

  const huesUsados = [];

  return (
    <main className="subjects-page">
      <header className="subjects-header">
        <div className="subjects-heading">
          <div className="subjects-title-row">
            <button
              type="button"
              className="subjects-back-button"
              onClick={() => navigate('/cursos')}
              aria-label="Voltar para cursos"
              title="Voltar para cursos"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <h1>Matérias</h1>
          </div>

          <p>Curso: {curso.nome}</p>
        </div>

        <div className="subjects-header-actions">
          {materias.length > 0 && (
            <div className="subjects-search">
              <input
                type="search"
                placeholder="Pesquisar matérias..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                aria-label="Pesquisar matérias"
              />
            </div>
          )}

          <button
            type="button"
            className="subjects-add-button"
            onClick={abrirCadastro}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="subjects-add-icon"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Adicionar matéria</span>
          </button>
        </div>
      </header>

      {erro && <p className="subjects-error">{erro}</p>}

      {materias.length === 0 ? (
        <EmptyState
          illustration={noSubjectsIllustration}
          title="Nenhuma matéria cadastrada"
          description="Adicione uma matéria para começar a organizar seus materiais de estudo."
        />
      ) : materiasFiltradas.length === 0 ? (
        <EmptyState
          illustration={noSubjectsIllustration}
          title="Nenhuma matéria encontrada"
          description="Não encontramos matérias com esse nome."
        />
      ) : (
        <section className="subjects-grid">
          {materiasFiltradas.map((materia) => {
            const tema = obterTemaMateria(materia?.id, huesUsados);

            if (typeof tema.hue === 'number') {
              huesUsados.push(tema.hue);
            }

            return (
              <div
                key={materia.id}
                className="subject-card"
                role="link"
                tabIndex={0}
                aria-label={`Abrir matéria ${materia.nome}`}
                onClick={() => abrirMateria(materia.id)}
                onKeyDown={(event) =>
                  handleCardKeyDown(event, materia.id)
                }
                style={obterEstilosTema(tema)}
              >
                <div className="subject-clipboard">
                  <div className="subject-clip" />

                  <div className="subject-paper">
                    <div className="subject-paper-lines" />

                    <div className="subject-paper-content">
                      <h2>{materia.nome}</h2>
                      <span className="subject-tag">Matéria</span>
                    </div>
                  </div>
                </div>

                <div className="subject-card-actions">
                  <button
                    type="button"
                    className="subject-icon-button subject-edit-button"
                    onClick={(event) => abrirEdicao(event, materia)}
                    onKeyDown={(event) => event.stopPropagation()}
                    aria-label={`Editar matéria ${materia.nome}`}
                    title="Editar matéria"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="subject-icon-button subject-delete-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setMateriaParaExcluir(materia);
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                    aria-label={`Excluir matéria ${materia.nome}`}
                    title="Excluir matéria"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m19 6-1 14H6L5 6" />
                      <path d="M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {mostrarModal && (
        <div
          className="subjects-modal-overlay"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="subjects-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>
              {materiaEditando ? 'Editar matéria' : 'Nova matéria'}
            </h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="nomeMateria">Nome da matéria</label>

              <input
                id="nomeMateria"
                type="text"
                value={nomeMateria}
                onChange={(event) => setNomeMateria(event.target.value)}
                placeholder="Digite o nome da matéria"
                autoFocus
              />

              {erro && <p className="subjects-error">{erro}</p>}

              <div className="subjects-modal-actions">
                <button
                  type="button"
                  className="subjects-cancel-button"
                  onClick={() => setMostrarModal(false)}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="subjects-confirm-button"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {materiaParaExcluir && (
        <div
          className="subjects-modal-overlay"
          onClick={() => setMateriaParaExcluir(null)}
        >
          <div
            className="subjects-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Excluir matéria?</h2>

            <p>
              Deseja realmente excluir a matéria
              {' '}
              <strong>{materiaParaExcluir.nome}</strong>?
            </p>

            <div className="subjects-modal-actions">
              <button
                type="button"
                className="subjects-cancel-button"
                onClick={() => setMateriaParaExcluir(null)}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="subjects-confirm-button"
                onClick={confirmarExclusao}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default SubjectsList;