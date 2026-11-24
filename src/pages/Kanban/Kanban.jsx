import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Kanban.css';

import EmptyState from '../../components/common/EmptyState/EmptyState';
import { atualizarQuadro, cadastrarQuadro, excluirQuadro, getQuadros } from '../../services/kanbanService';
import { getMaterias } from '../../services/materiaService';
import { obterEstilosTema, obterTemaMateria } from '../../utils/temaEntidade';

import noKanban from '../../assets/illustrations/empty-states/no-kanban.svg';

function Kanban() {
  const navigate = useNavigate();

  const [quadros, setQuadros] = useState([]);
  const [materias, setMaterias] = useState([]);

  const [pesquisa, setPesquisa] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [quadroEditando, setQuadroEditando] = useState(null);

  const [nome, setNome] = useState('');
  const [materiaId, setMateriaId] = useState('');

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const [dadosQuadros, dadosMaterias] = await Promise.all([
        getQuadros(),
        getMaterias(),
      ]);

      setQuadros(dadosQuadros);
      setMaterias(dadosMaterias);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar os quadros.');
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalCadastro() {
    setQuadroEditando(null);
    setNome('');
    setMateriaId(materias[0]?.id || '');
    setErro('');
    setModalAberto(true);
  }

  function abrirModalEdicao(quadro) {
    setQuadroEditando(quadro);
    setNome(quadro.nome);
    setMateriaId(quadro.materiaId);
    setErro('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setQuadroEditando(null);
    setNome('');
    setMateriaId('');
    setErro('');
  }

  async function handleSalvar(event) {
    event.preventDefault();

    if (!nome.trim() || !materiaId) {
      setErro('Preencha o nome e selecione uma matéria.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');

      if (quadroEditando) {
        await atualizarQuadro(
          quadroEditando.id,
          nome.trim(),
          materiaId
        );
      } else {
        await cadastrarQuadro(nome.trim(), materiaId);
      }

      fecharModal();
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o quadro.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(quadro) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o quadro "${quadro.nome}"?`
    );

    if (!confirmar) return;

    try {
      setErro('');
      await excluirQuadro(quadro.id);
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir o quadro.');
    }
  }

  function handleAbrirQuadro(quadro) {
    navigate(`/kanban/${quadro.id}`);
  }

  const quadrosFiltrados = quadros.filter((quadro) => {
    const materia = materias.find(
      (item) => item.id === quadro.materiaId
    );

    const termo = pesquisa.toLowerCase();

    return (
      quadro.nome.toLowerCase().includes(termo) ||
      (materia?.nome || '').toLowerCase().includes(termo)
    );
  });

  if (carregando) {
    return (
      <main className="kanban-page">
        <p className="kanban-message">Carregando quadros...</p>
      </main>
    );
  }

  const huesUsados = [];

  return (
    <main className="kanban-page">
      <header className="kanban-header">
        <div className="kanban-header-info">
          <h1>Kanban</h1>
          <p>Organize e acompanhe suas tarefas.</p>
        </div>

        <div className="kanban-header-actions">
          {quadros.length > 0 && (
            <div className="kanban-search">
              <input
                type="search"
                placeholder="Pesquisar quadros..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                aria-label="Pesquisar quadros"
              />
            </div>
          )}

          <button
            type="button"
            className="kanban-add-button"
            onClick={abrirModalCadastro}
            disabled={materias.length === 0}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="kanban-add-icon"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Novo quadro</span>
          </button>
        </div>
      </header>

      {erro && <p className="kanban-error">{erro}</p>}

      {materias.length === 0 && quadros.length === 0 ? (
        <EmptyState
          illustration={noKanban}
          title="Nenhum quadro disponível"
          description="Cadastre uma matéria primeiro para criar seu quadro Kanban."
        />
      ) : quadrosFiltrados.length === 0 ? (
        <EmptyState
          illustration={noKanban}
          title="Nenhum quadro encontrado"
          description="Não encontramos quadros com esse nome."
        />
      ) : (
        <section className="kanban-boards">
          {quadrosFiltrados.map((quadro) => {
            const materia = materias.find(
              (item) => item.id === quadro.materiaId
            );

            const idReferenciaMateria = quadro.materiaId ?? materia?.id;
            const tema = obterTemaMateria(idReferenciaMateria, huesUsados);

            if (typeof tema.hue === 'number') {
              huesUsados.push(tema.hue);
            }

            return (
              <article
                className="kanban-board-card"
                key={quadro.id}
                style={obterEstilosTema(tema)}
              >
                <button
                  type="button"
                  className="kanban-board-open"
                  onClick={() => handleAbrirQuadro(quadro)}
                >
                  <div className="kanban-board-info">
                    <h2>{quadro.nome}</h2>
                    <span className="kanban-materia-tag">
                      {materia?.nome || 'Matéria não encontrada'}
                    </span>
                  </div>

                  <div className="kanban-board-preview">
                    <div className="kanban-preview-column">
                      <span className="kanban-preview-title">
                        A Fazer
                      </span>
                      <div className="kanban-preview-line" />
                      <div className="kanban-preview-line" />
                    </div>

                    <div className="kanban-preview-column">
                      <span className="kanban-preview-title">
                        Fazendo
                      </span>
                      <div className="kanban-preview-line" />
                      <div className="kanban-preview-line" />
                    </div>

                    <div className="kanban-preview-column">
                      <span className="kanban-preview-title">
                        Feito
                      </span>
                      <div className="kanban-preview-line" />
                      <div className="kanban-preview-line" />
                    </div>
                  </div>
                </button>

                <div className="kanban-board-actions">
                  <button
                    type="button"
                    className="kanban-icon-button"
                    onClick={() => abrirModalEdicao(quadro)}
                    aria-label={`Editar quadro ${quadro.nome}`}
                    title="Editar quadro"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="kanban-icon-button"
                    onClick={() => handleExcluir(quadro)}
                    aria-label={`Excluir quadro ${quadro.nome}`}
                    title="Excluir quadro"
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
        </section>
      )}

      {modalAberto && (
        <div className="kanban-modal-overlay">
          <form
            className="kanban-modal"
            onSubmit={handleSalvar}
          >
            <h2>
              {quadroEditando ? 'Editar quadro' : 'Novo quadro'}
            </h2>

            <div className="kanban-form-group">
              <label htmlFor="quadro-nome">Nome do quadro</label>
              <input
                id="quadro-nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite o nome do quadro"
                required
              />
            </div>

            <div className="kanban-form-group">
              <label htmlFor="quadro-materia">Matéria</label>
              <select
                id="quadro-materia"
                value={materiaId}
                onChange={(event) => setMateriaId(event.target.value)}
                required
              >
                <option value="">Selecione uma matéria</option>

                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nome}
                  </option>
                ))}
              </select>
            </div>

            {erro && <p className="kanban-error">{erro}</p>}

            <div className="kanban-modal-actions">
              <button
                type="button"
                className="kanban-cancel-button"
                onClick={fecharModal}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="kanban-save-button"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default Kanban;