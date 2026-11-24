import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getMaterias } from '../../services/materiaService';
import {
    atualizarItem,
    buscarLista,
    cadastrarItem,
    excluirItem,
    getItens,
} from '../../services/todoService';
import { obterEstilosTema, obterTemaMateria } from '../../utils/temaEntidade';

import './TodoList.css';

function TodoList() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lista, setLista] = useState(null);
  const [materia, setMateria] = useState(null);
  const [itens, setItens] = useState([]);

  const [descricao, setDescricao] = useState('');
  const [itemEditando, setItemEditando] = useState(null);

  const [formularioAberto, setFormularioAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const [listaData, itensData, materiasData] = await Promise.all([
        buscarLista(id),
        getItens(),
        getMaterias(),
      ]);

      setLista(listaData);

      setItens(
        itensData.filter((item) => item.listaId === id)
      );

      const materiaEncontrada = materiasData.find(
        (item) => item.id === listaData.materiaId
      );

      setMateria(materiaEncontrada || null);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar a lista.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [id]);

  function abrirFormulario() {
    setItemEditando(null);
    setDescricao('');
    setFormularioAberto(true);
    setErro('');
  }

  function abrirEdicao(item) {
    setItemEditando(item);
    setDescricao(item.descricao);
    setFormularioAberto(true);
    setErro('');
  }

  function fecharFormulario() {
    setFormularioAberto(false);
    setItemEditando(null);
    setDescricao('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!descricao.trim()) {
      setErro('Informe a descrição do item.');
      return;
    }

    try {
      setErro('');

      if (itemEditando) {
        await atualizarItem(itemEditando.id, {
          descricao: descricao.trim(),
        });
      } else {
        await cadastrarItem(descricao.trim(), id);
      }

      fecharFormulario();
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o item.');
    }
  }

  async function handleConcluir(item) {
    try {
      setErro('');

      await atualizarItem(item.id, {
        feito: !item.feito,
      });

      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível atualizar o item.');
    }
  }

  async function handleExcluir(itemId) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este item?'
    );

    if (!confirmar) return;

    try {
      setErro('');
      await excluirItem(itemId);
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir o item.');
    }
  }

  const itensConcluidos = itens.filter((item) => item.feito);
  const itensPendentes = itens.filter((item) => !item.feito);

  const idReferenciaMateria = lista?.materiaId ?? materia?.id;
  const tema = obterTemaMateria(idReferenciaMateria);

  if (carregando) {
    return (
      <main className="todo-list-page">
        <p className="todo-list-feedback">Carregando lista...</p>
      </main>
    );
  }

  if (!lista) {
    return (
      <main className="todo-list-page">
        <div className="todo-list-header">
          <div className="todo-list-heading">
            <div className="todo-list-title-row">
              <button
                type="button"
                className="todo-list-back-button"
                onClick={() => navigate('/todo')}
                aria-label="Voltar para listas"
                title="Voltar para listas"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </button>

              <h1>Lista não encontrada</h1>
            </div>
          </div>
        </div>

        <p className="todo-list-error">
          {erro || 'Lista não encontrada.'}
        </p>
      </main>
    );
  }

  return (
    <main
      className="todo-list-page"
      style={obterEstilosTema(tema)}
    >
      <header className="todo-list-header">
        <div className="todo-list-heading">
          <div className="todo-list-title-row">
            <button
              type="button"
              className="todo-list-back-button"
              onClick={() => navigate('/todo')}
              aria-label="Voltar para listas"
              title="Voltar para listas"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <h1>{lista.nome}</h1>
          </div>

          <span className="todo-materia-tag">
            {materia ? materia.nome : 'Matéria não encontrada'}
          </span>
        </div>

        <button
          type="button"
          className="todo-list-add-button"
          onClick={abrirFormulario}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="todo-list-add-icon"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Adicionar item</span>
        </button>
      </header>

      {formularioAberto && (
        <form
          className="todo-item-form"
          onSubmit={handleSubmit}
        >
          <h2>
            {itemEditando ? 'Editar item' : 'Novo item'}
          </h2>

          <div className="todo-item-form-group">
            <label htmlFor="todo-item-descricao">
              Descrição
            </label>

            <input
              id="todo-item-descricao"
              type="text"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Digite a descrição do item"
              autoFocus
            />
          </div>

          {erro && (
            <p className="todo-list-error">{erro}</p>
          )}

          <div className="todo-item-form-actions">
            <button
              type="button"
              className="todo-item-cancel-button"
              onClick={fecharFormulario}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="todo-item-save-button"
            >
              {itemEditando ? 'Salvar alterações' : 'Adicionar item'}
            </button>
          </div>
        </form>
      )}

      {!formularioAberto && erro && (
        <p className="todo-list-error">{erro}</p>
      )}

      <section className="todo-items-content">
        <div className="todo-items-summary">
          <span>{itens.length} itens</span>
          <span>{itensConcluidos.length} concluídos</span>
          <span>{itensPendentes.length} pendentes</span>
        </div>

        {itens.length === 0 ? (
          <div className="todo-items-empty">
            <h2>Nenhum item cadastrado</h2>
            <p>
              Adicione o primeiro item para começar a organizar suas atividades.
            </p>
          </div>
        ) : (
          <div className="todo-items-list">
            {itens.map((item) => (
              <article
                className={`todo-item-card ${item.feito ? 'todo-item-completed' : ''}`}
                key={item.id}
              >
                <label className="todo-item-checkbox">
                  <input
                    type="checkbox"
                    checked={item.feito}
                    onChange={() => handleConcluir(item)}
                  />

                  <span>{item.descricao}</span>
                </label>

                <div className="todo-item-actions">
                  <button
                    type="button"
                    className="todo-icon-button"
                    onClick={() => abrirEdicao(item)}
                    aria-label={`Editar item ${item.descricao}`}
                    title="Editar item"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="todo-icon-button todo-delete-button"
                    onClick={() => handleExcluir(item.id)}
                    aria-label={`Excluir item ${item.descricao}`}
                    title="Excluir item"
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
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default TodoList;