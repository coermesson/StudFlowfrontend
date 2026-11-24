import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import noFilesIllustration from '../../assets/illustrations/empty-states/no-files.svg';
import EmptyState from '../../components/common/EmptyState/EmptyState';

import {
  baixarArquivo,
  cadastrarArquivo,
  excluirArquivo,
  getArquivos,
} from '../../services/arquivoService';
import { buscarMateria } from '../../services/materiaService';
import { obterEstilosTema, obterTemaMateria } from '../../utils/temaEntidade';

import './Resources.css';

const LIMITE_ARQUIVO = 10 * 1024 * 1024;

function Resources() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [materia, setMateria] = useState(null);
  const [arquivos, setArquivos] = useState([]);
  const [busca, setBusca] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);

  const [pdfUrl, setPdfUrl] = useState('');
  const [arquivoVisualizado, setArquivoVisualizado] = useState(null);
  const [carregandoPdf, setCarregandoPdf] = useState(false);

  const [arquivoParaExcluir, setArquivoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      setErro('');
      setMensagem('');
      setBusca('');
      setArquivoSelecionado(null);

      try {
        const [dadosMateria, todosArquivos] = await Promise.all([
          buscarMateria(id),
          getArquivos(),
        ]);

        setMateria(dadosMateria);

        const arquivosDaMateria = todosArquivos.filter(
          (arquivo) => String(arquivo.materiaId) === String(id)
        );

        setArquivos(arquivosDaMateria);
      } catch (error) {
        setMateria(null);
        setArquivos([]);
        setErro(error.message || 'Não foi possível carregar os recursos.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  async function atualizarLista() {
    const todosArquivos = await getArquivos();

    const arquivosDaMateria = todosArquivos.filter(
      (arquivo) => String(arquivo.materiaId) === String(id)
    );

    setArquivos(arquivosDaMateria);
  }

  function voltarParaMaterias() {
    if (materia?.cursoId) {
      navigate(`/cursos/${materia.cursoId}`);
    } else {
      navigate('/cursos');
    }
  }

  function handleSelecionarArquivo(event) {
    const arquivo = event.target.files?.[0];

    setErro('');
    setMensagem('');

    if (!arquivo) return;

    const extensaoValida = arquivo.name.toLowerCase().endsWith('.pdf');

    if (!extensaoValida) {
      setArquivoSelecionado(null);
      setErro('Selecione um arquivo no formato PDF.');
      event.target.value = '';
      return;
    }

    if (arquivo.size > LIMITE_ARQUIVO) {
      setArquivoSelecionado(null);
      setErro('O arquivo deve ter no máximo 10 MB.');
      event.target.value = '';
      return;
    }

    setArquivoSelecionado(arquivo);
  }

  async function handleEnviarArquivo() {
    if (!arquivoSelecionado || !materia) return;

    setEnviando(true);
    setErro('');
    setMensagem('');

    try {
      await cadastrarArquivo(arquivoSelecionado, materia.id);

      await atualizarLista();

      setArquivoSelecionado(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setMensagem('Arquivo cadastrado com sucesso!');
    } catch (error) {
      setErro(error.message || 'Não foi possível cadastrar o arquivo.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleVisualizarArquivo(arquivo) {
    setCarregandoPdf(true);
    setErro('');
    setMensagem('');

    try {
      const arquivoBlob = await baixarArquivo(arquivo.id);
      const novaUrl = URL.createObjectURL(arquivoBlob);

      setPdfUrl(novaUrl);
      setArquivoVisualizado(arquivo);
    } catch (error) {
      setErro(error.message || 'Não foi possível abrir o PDF.');
    } finally {
      setCarregandoPdf(false);
    }
  }

  function fecharVisualizacao() {
    setPdfUrl('');
    setArquivoVisualizado(null);
  }

  async function handleBaixarArquivo(arquivo) {
    setErro('');
    setMensagem('');

    try {
      const arquivoBlob = await baixarArquivo(arquivo.id);
      const url = URL.createObjectURL(arquivoBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = arquivo.nome.toLowerCase().endsWith('.pdf')
        ? arquivo.nome
        : `${arquivo.nome}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      setErro(error.message || 'Não foi possível baixar o arquivo.');
    }
  }

  async function confirmarExclusao() {
    if (!arquivoParaExcluir) return;

    setExcluindo(true);
    setErro('');
    setMensagem('');

    try {
      await excluirArquivo(arquivoParaExcluir.id);

      setArquivos((arquivosAtuais) =>
        arquivosAtuais.filter((item) => item.id !== arquivoParaExcluir.id)
      );

      if (arquivoVisualizado?.id === arquivoParaExcluir.id) {
        fecharVisualizacao();
      }

      setArquivoParaExcluir(null);
      setMensagem('Arquivo excluído com sucesso!');
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir o arquivo.');
    } finally {
      setExcluindo(false);
    }
  }

  const arquivosFiltrados = arquivos.filter((arquivo) =>
    arquivo.nome.toLowerCase().includes(busca.trim().toLowerCase())
  );

  const tema = obterTemaMateria(materia?.id ?? id);

  if (carregando) {
    return (
      <main className="resources-page">
        <p className="resources-message">Carregando recursos...</p>
      </main>
    );
  }

  if (!materia) {
    return (
      <main className="resources-page">
        <header className="resources-header">
          <div className="resources-header-info">
            <div className="resources-title-row">
              <button
                type="button"
                className="resources-back-button"
                onClick={() => navigate('/cursos')}
                aria-label="Voltar para cursos"
                title="Voltar para cursos"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </button>

              <h1>Recursos</h1>
            </div>
          </div>
        </header>

        <p className="resources-error">
          {erro || 'Matéria não encontrada.'}
        </p>
      </main>
    );
  }

  return (
    <main
      className="resources-page"
      style={obterEstilosTema(tema)}
    >
      <header className="resources-header">
        <div className="resources-header-info">
          <div className="resources-title-row">
            <button
              type="button"
              className="resources-back-button"
              onClick={voltarParaMaterias}
              aria-label="Voltar para matérias"
              title="Voltar para matérias"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <h1>Recursos</h1>
          </div>

          <span className="resources-materia-tag">
            {materia.nome}
          </span>
        </div>

        <div className="resources-header-actions">
          {arquivos.length > 0 && (
            <div className="resources-search">
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar arquivo pelo nome..."
                aria-label="Buscar arquivo pelo nome"
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleSelecionarArquivo}
            className="resources-file-input"
          />

          <button
            type="button"
            className="resources-select-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={enviando}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="resources-add-icon"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Selecionar PDF</span>
          </button>
        </div>
      </header>

      <section className="resources-content">
        {arquivoSelecionado && (
          <div className="resources-selected-banner">
            <div className="resources-selected-info">
              <span className="resources-file-type">PDF</span>
              <div>
                <strong>{arquivoSelecionado.name}</strong>
                <p>Pronto para envio (máx. 10 MB)</p>
              </div>
            </div>

            <div className="resources-selected-actions">
              <button
                type="button"
                className="resources-cancel-button"
                onClick={() => {
                  setArquivoSelecionado(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={enviando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="resources-upload-button"
                onClick={handleEnviarArquivo}
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar arquivo'}
              </button>
            </div>
          </div>
        )}

        {erro && <p className="resources-error">{erro}</p>}
        {mensagem && <p className="resources-success">{mensagem}</p>}

        {carregandoPdf && (
          <p className="resources-message">Carregando PDF...</p>
        )}

        <div className="resources-list-header">
          <h2>Arquivos cadastrados</h2>
          <span>
            {arquivos.length} {arquivos.length === 1 ? 'arquivo' : 'arquivos'}
          </span>
        </div>

        {arquivos.length === 0 ? (
          <EmptyState
            illustration={noFilesIllustration}
            title="Nenhum recurso cadastrado"
            description="Os arquivos e materiais de estudo desta matéria aparecerão aqui."
          />
        ) : arquivosFiltrados.length === 0 ? (
          <EmptyState
            illustration={noFilesIllustration}
            title="Nenhum arquivo encontrado"
            description={`Não encontramos arquivos para "${busca}".`}
          />
        ) : (
          <div className="resources-list">
            {arquivosFiltrados.map((arquivo) => (
              <article className="resources-file-card" key={arquivo.id}>
                <div className="resources-file-info">
                  <span className="resources-file-type">PDF</span>

                  <div>
                    <h3>{arquivo.nome}</h3>
                    <p>Documento PDF</p>
                  </div>
                </div>

                <div className="resources-file-actions">
                  <button
                    type="button"
                    className="resources-icon-button resources-view-icon-button"
                    onClick={() => handleVisualizarArquivo(arquivo)}
                    disabled={carregandoPdf}
                    aria-label={`Visualizar ${arquivo.nome}`}
                    title="Visualizar PDF"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="resources-icon-button"
                    onClick={() => handleBaixarArquivo(arquivo)}
                    aria-label={`Baixar ${arquivo.nome}`}
                    title="Baixar PDF"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="resources-icon-button resources-delete-icon-button"
                    onClick={() => setArquivoParaExcluir(arquivo)}
                    aria-label={`Excluir ${arquivo.nome}`}
                    title="Excluir arquivo"
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

      {pdfUrl && arquivoVisualizado && (
        <div
          className="resources-modal-overlay"
          onClick={fecharVisualizacao}
        >
          <section
            className="resources-viewer-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Visualização de ${arquivoVisualizado.nome}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="resources-viewer-header">
              <div>
                <h2>{arquivoVisualizado.nome}</h2>
                <p>Visualização do documento PDF</p>
              </div>

              <div className="resources-viewer-actions">
                <button
                  type="button"
                  className="resources-secondary-button"
                  onClick={() => handleBaixarArquivo(arquivoVisualizado)}
                >
                  Baixar
                </button>

                <button
                  type="button"
                  className="resources-close-viewer"
                  onClick={fecharVisualizacao}
                >
                  Fechar
                </button>
              </div>
            </div>

            <iframe
              className="resources-pdf-frame"
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              title={`Visualização de ${arquivoVisualizado.nome}`}
            />
          </section>
        </div>
      )}

      {arquivoParaExcluir && (
        <div
          className="resources-modal-overlay"
          onClick={() => {
            if (!excluindo) setArquivoParaExcluir(null);
          }}
        >
          <section
            className="resources-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Excluir arquivo?</h2>

            <p>
              Deseja realmente excluir o arquivo{' '}
              <strong>{arquivoParaExcluir.nome}</strong>? Essa ação não poderá ser desfeita.
            </p>

            <div className="resources-modal-actions">
              <button
                type="button"
                className="resources-cancel-button"
                onClick={() => setArquivoParaExcluir(null)}
                disabled={excluindo}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="resources-confirm-delete-button"
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Resources;