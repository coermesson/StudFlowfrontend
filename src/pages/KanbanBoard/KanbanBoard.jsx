import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './KanbanBoard.css';

import {
  atualizarTarefa,
  buscarQuadro,
  cadastrarTarefa,
  excluirTarefa,
  getTarefas,
} from '../../services/kanbanService';

import { getMaterias } from '../../services/materiaService';

const colunas = [
  { id: 'a fazer', titulo: 'A Fazer', cor: '#FF8787' },
  { id: 'fazendo', titulo: 'Fazendo', cor: '#DCBAFF' },
  { id: 'feito', titulo: 'Feito', cor: '#C2D0FF' },
];

const prioridades = ['baixa', 'média', 'alta'];

function KanbanBoard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quadro, setQuadro] = useState(null);
  const [materia, setMateria] = useState(null);
  const [tarefas, setTarefas] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('média');
  const [status, setStatus] = useState('a fazer');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const [dadosQuadro, dadosTarefas, dadosMaterias] =
        await Promise.all([
          buscarQuadro(id),
          getTarefas(),
          getMaterias(),
        ]);

      setQuadro(dadosQuadro);

      setMateria(
        dadosMaterias.find(
          (item) => item.id === dadosQuadro.materiaId
        ) || null
      );

      setTarefas(
        dadosTarefas.filter(
          (tarefa) => tarefa.quadroId === id
        )
      );
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar o quadro.');
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalCadastro() {
    setTarefaEditando(null);
    setTitulo('');
    setDescricao('');
    setPrioridade('média');
    setStatus('a fazer');
    setErro('');
    setModalAberto(true);
  }

  function abrirModalEdicao(tarefa) {
    setTarefaEditando(tarefa);
    setTitulo(tarefa.titulo);
    setDescricao(tarefa.descricao || '');
    setPrioridade(tarefa.prioridade);
    setStatus(tarefa.status);
    setErro('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setTarefaEditando(null);
    setErro('');
  }

  async function handleSalvar(event) {
    event.preventDefault();

    if (!titulo.trim() || !descricao.trim()) {
      setErro('Preencha o título e a descrição da tarefa.');
      return;
    }

    const dados = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      prioridade,
      status,
      quadroId: id,
    };

    try {
      setSalvando(true);
      setErro('');

      if (tarefaEditando) {
        await atualizarTarefa(tarefaEditando.id, dados);
      } else {
        await cadastrarTarefa(dados);
      }

      fecharModal();
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar a tarefa.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(tarefa) {
    const confirmar = window.confirm(
      `Deseja excluir a tarefa "${tarefa.titulo}"?`
    );

    if (!confirmar) return;

    try {
      setErro('');
      await excluirTarefa(tarefa.id);
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a tarefa.');
    }
  }

  async function handleMoverTarefa(tarefa, novoStatus) {
    if (tarefa.status === novoStatus) return;

    try {
      setErro('');

      await atualizarTarefa(tarefa.id, {
        status: novoStatus,
      });

      setTarefas((tarefasAtuais) =>
        tarefasAtuais.map((item) =>
          item.id === tarefa.id
            ? { ...item, status: novoStatus }
            : item
        )
      );
    } catch (error) {
      setErro(error.message || 'Não foi possível mover a tarefa.');
    }
  }

  function handleDragStart(event, tarefa) {
    event.dataTransfer.setData('text/plain', tarefa.id);
  }

  async function handleDrop(event, novoStatus) {
    event.preventDefault();

    const tarefaId = event.dataTransfer.getData('text/plain');

    const tarefa = tarefas.find(
      (item) => item.id === tarefaId
    );

    if (tarefa) {
      await handleMoverTarefa(tarefa, novoStatus);
    }
  }

  if (carregando) {
    return (
      <main className="kanban-board-page">
        <p className="kanban-board-message">Carregando quadro...</p>
      </main>
    );
  }

  if (!quadro) {
    return (
      <main className="kanban-board-page">
        <div className="kanban-board-page-header">
          <div className="kanban-board-heading">
            <div className="kanban-board-title-row">
              <button
                type="button"
                className="kanban-board-back"
                onClick={() => navigate('/kanban')}
                aria-label="Voltar para quadros"
                title="Voltar para quadros"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </button>

              <h1>Quadro não encontrado</h1>
            </div>
          </div>
        </div>

        <p className="kanban-board-error">
          {erro || 'Quadro não encontrado.'}
        </p>
      </main>
    );
  }

  return (
    <main className="kanban-board-page">
      <header className="kanban-board-page-header">
        <div className="kanban-board-heading">
          <div className="kanban-board-title-row">
            <button
              type="button"
              className="kanban-board-back"
              onClick={() => navigate('/kanban')}
              aria-label="Voltar para quadros"
              title="Voltar para quadros"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <h1>{quadro.nome}</h1>
          </div>

          <p>{materia?.nome || 'Matéria não encontrada'}</p>
        </div>

        <button
          type="button"
          className="kanban-board-add"
          onClick={abrirModalCadastro}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="kanban-board-add-icon"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Nova tarefa</span>
        </button>
      </header>

      {erro && (
        <p className="kanban-board-error">{erro}</p>
      )}

      <section className="kanban-board-columns">
        {colunas.map((coluna) => {
          const tarefasDaColuna = tarefas.filter(
            (tarefa) => tarefa.status === coluna.id
          );

          return (
            <div
              className="kanban-board-column"
              key={coluna.id}
              style={{ '--column-color': coluna.cor }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, coluna.id)}
            >
              <header className="kanban-board-column-header">
                <div className="kanban-board-column-title">
                  <span className="kanban-column-dot" aria-hidden="true" />
                  <h2>{coluna.titulo}</h2>
                </div>

                <span className="kanban-column-count">
                  {tarefasDaColuna.length}
                </span>
              </header>

              <div className="kanban-board-column-content">
                {tarefasDaColuna.length === 0 ? (
                  <p className="kanban-board-empty">
                    Nenhuma tarefa
                  </p>
                ) : (
                  tarefasDaColuna.map((tarefa) => (
                    <article
                      className="kanban-task-card"
                      key={tarefa.id}
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(event, tarefa)
                      }
                    >
                      <div className="kanban-task-card-header">
                        <h3>{tarefa.titulo}</h3>

                        <span
                          className={`kanban-task-priority priority-${
                            prioridades.indexOf(tarefa.prioridade) + 1
                          }`}
                        >
                          {tarefa.prioridade}
                        </span>
                      </div>

                      {tarefa.descricao && (
                        <p className="kanban-task-description">
                          {tarefa.descricao}
                        </p>
                      )}

                      <div className="kanban-task-actions">
                        <button
                          type="button"
                          className="kanban-task-icon-button"
                          onClick={() => abrirModalEdicao(tarefa)}
                          aria-label={`Editar tarefa ${tarefa.titulo}`}
                          title="Editar tarefa"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="kanban-task-icon-button kanban-task-delete"
                          onClick={() => handleExcluir(tarefa)}
                          aria-label={`Excluir tarefa ${tarefa.titulo}`}
                          title="Excluir tarefa"
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>

      {modalAberto && (
        <div className="kanban-task-modal-overlay">
          <form
            className="kanban-task-modal"
            onSubmit={handleSalvar}
          >
            <h2>
              {tarefaEditando ? 'Editar tarefa' : 'Nova tarefa'}
            </h2>

            <div className="kanban-task-form-group">
              <label htmlFor="tarefa-titulo">Título</label>
              <input
                id="tarefa-titulo"
                type="text"
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                required
              />
            </div>

            <div className="kanban-task-form-group">
              <label htmlFor="tarefa-descricao">Descrição</label>
              <textarea
                id="tarefa-descricao"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                required
              />
            </div>

            <div className="kanban-task-form-group">
              <label htmlFor="tarefa-prioridade">Prioridade</label>
              <select
                id="tarefa-prioridade"
                value={prioridade}
                onChange={(event) => setPrioridade(event.target.value)}
              >
                {prioridades.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="kanban-task-form-group">
              <label htmlFor="tarefa-status">Status</label>
              <select
                id="tarefa-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {colunas.map((coluna) => (
                  <option key={coluna.id} value={coluna.id}>
                    {coluna.titulo}
                  </option>
                ))}
              </select>
            </div>

            {erro && (
              <p className="kanban-board-error">{erro}</p>
            )}

            <div className="kanban-task-modal-actions">
              <button
                type="button"
                className="kanban-task-cancel"
                onClick={fecharModal}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="kanban-task-save"
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

export default KanbanBoard;