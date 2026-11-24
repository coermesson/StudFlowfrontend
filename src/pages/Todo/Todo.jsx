import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Todo.css';

import EmptyState from '../../components/common/EmptyState/EmptyState';

import {
  atualizarLista,
  cadastrarLista,
  excluirLista,
  getListas,
} from '../../services/todoService';

import { getMaterias } from '../../services/materiaService';
import { obterEstilosTema, obterTemaMateria } from '../../utils/temaEntidade';

import noTodoTasks from '../../assets/illustrations/empty-states/no-todo-tasks.svg';

function Todo() {
  const navigate = useNavigate();

  const [listas, setListas] = useState([]);
  const [materias, setMaterias] = useState([]);

  const [pesquisa, setPesquisa] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [listaEditando, setListaEditando] = useState(null);

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

      const [dadosListas, dadosMaterias] = await Promise.all([
        getListas(),
        getMaterias(),
      ]);

      setListas(dadosListas);
      setMaterias(dadosMaterias);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar as listas.');
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalCadastro() {
    setListaEditando(null);
    setNome('');
    setMateriaId(materias[0]?.id || '');
    setErro('');
    setModalAberto(true);
  }

  function abrirModalEdicao(lista) {
    setListaEditando(lista);
    setNome(lista.nome);
    setMateriaId(lista.materiaId);
    setErro('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setListaEditando(null);
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

      if (listaEditando) {
        await atualizarLista(
          listaEditando.id,
          nome.trim(),
          materiaId
        );
      } else {
        await cadastrarLista(nome.trim(), materiaId);
      }

      fecharModal();
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar a lista.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(lista) {
    const confirmar = window.confirm(
      `Deseja realmente excluir a lista "${lista.nome}"?`
    );

    if (!confirmar) return;

    try {
      setErro('');
      await excluirLista(lista.id);
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a lista.');
    }
  }

  function handleAbrirLista(lista) {
    navigate(`/todo/${lista.id}`);
  }

  const listasFiltradas = listas.filter((lista) => {
    const materia = materias.find(
      (item) => item.id === lista.materiaId
    );

    const termo = pesquisa.toLowerCase();

    return (
      lista.nome.toLowerCase().includes(termo) ||
      (materia?.nome || '').toLowerCase().includes(termo)
    );
  });

  if (carregando) {
    return (
      <main className="todo-page">
        <p className="todo-message">Carregando listas...</p>
      </main>
    );
  }

  const huesUsados = [];

  return (
    <main className="todo-page">
      <header className="todo-header">
        <div className="todo-header-info">
          <div className="todo-title-row">
            <button
              type="button"
              className="todo-back-button"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              title="Voltar"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <h1>ToDo</h1>
          </div>

          <p>Organize suas atividades e acompanhe seu progresso.</p>
        </div>

        <div className="todo-header-actions">
          {listas.length > 0 && (
            <div className="todo-search">
              <input
                type="search"
                placeholder="Pesquisar listas..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                aria-label="Pesquisar listas"
              />
            </div>
          )}

          <button
            type="button"
            className="todo-add-button"
            onClick={abrirModalCadastro}
            disabled={materias.length === 0}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="todo-add-icon"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Nova lista</span>
          </button>
        </div>
      </header>

      {erro && !modalAberto && (
        <p className="todo-error">{erro}</p>
      )}

      {materias.length === 0 && listas.length === 0 ? (
        <EmptyState
          illustration={noTodoTasks}
          title="Nenhuma lista disponível"
          description="Cadastre uma matéria primeiro para criar sua lista de tarefas."
        />
      ) : listasFiltradas.length === 0 ? (
        <EmptyState
          illustration={noTodoTasks}
          title="Nenhuma lista encontrada"
          description="Não encontramos listas com esse nome."
        />
      ) : (
        <section className="todo-lists">
          {listasFiltradas.map((lista) => {
            const materia = materias.find(
              (item) => item.id === lista.materiaId
            );

            const idReferenciaMateria = lista.materiaId ?? materia?.id;
            const tema = obterTemaMateria(idReferenciaMateria, huesUsados);

            if (typeof tema.hue === 'number') {
              huesUsados.push(tema.hue);
            }

            return (
              <article
                className="todo-list-card"
                key={lista.id}
                style={obterEstilosTema(tema)}
              >
                <button
                  type="button"
                  className="todo-list-open"
                  onClick={() => handleAbrirLista(lista)}
                >
                  <div className="todo-list-info">
                    <h2>{lista.nome}</h2>
                    <span className="todo-materia-tag">
                      {materia?.nome || 'Matéria não encontrada'}
                    </span>
                  </div>

                  <div className="todo-list-preview">
                    <div className="todo-preview-item">
                      <span className="todo-preview-checkbox" />
                      <span className="todo-preview-line" />
                    </div>

                    <div className="todo-preview-item">
                      <span className="todo-preview-checkbox" />
                      <span className="todo-preview-line" />
                    </div>

                    <div className="todo-preview-item">
                      <span className="todo-preview-checkbox" />
                      <span className="todo-preview-line" />
                    </div>
                  </div>
                </button>

                <div className="todo-list-actions">
                  <button
                    type="button"
                    className="todo-icon-button"
                    onClick={() => abrirModalEdicao(lista)}
                    aria-label={`Editar lista ${lista.nome}`}
                    title="Editar lista"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="todo-icon-button todo-delete-button"
                    onClick={() => handleExcluir(lista)}
                    aria-label={`Excluir lista ${lista.nome}`}
                    title="Excluir lista"
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
        <div
          className="todo-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharModal();
            }
          }}
        >
          <form className="todo-modal" onSubmit={handleSalvar}>
            <h2>
              {listaEditando ? 'Editar lista' : 'Nova lista'}
            </h2>

            <div className="todo-form-group">
              <label htmlFor="todo-nome">Nome da lista</label>
              <input
                id="todo-nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite o nome da lista"
                required
              />
            </div>

            <div className="todo-form-group">
              <label htmlFor="todo-materia">Matéria</label>
              <select
                id="todo-materia"
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

            {erro && <p className="todo-error">{erro}</p>}

            <div className="todo-modal-actions">
              <button
                type="button"
                className="todo-cancel-button"
                onClick={fecharModal}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="todo-save-button"
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

export default Todo;