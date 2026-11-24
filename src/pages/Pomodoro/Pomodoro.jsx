
import { usePomodoro } from '../../contexts/PomodoroContext';
import './Pomodoro.css';

function formatarTempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;

  return `${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
}

const modos = [
  { id: 'foco', nome: 'Foco', duracao: '25 min' },
  { id: 'pausaCurta', nome: 'Pausa curta', duracao: '5 min' },
  { id: 'pausaLonga', nome: 'Pausa longa', duracao: '15 min' },
];

export default function Pomodoro() {
  const {
    modo,
    tempoRestante,
    emAndamento,
    fimDoCiclo,
    iniciar,
    pausar,
    reiniciar,
    selecionarModo,
  } = usePomodoro();

  const progresso =
    ((modo === 'foco' ? 25 * 60 : modo === 'pausaCurta' ? 5 * 60 : 15 * 60) -
      tempoRestante) /
    (modo === 'foco' ? 25 * 60 : modo === 'pausaCurta' ? 5 * 60 : 15 * 60);

  return (
    <main className="pomodoro-page">
      <header className="pomodoro-header">
        <h1>Pomodoro</h1>
        <p>Organize seu tempo e mantenha o foco nos estudos.</p>
      </header>

      <section className="pomodoro-container">
        <div className="pomodoro-modes">
          {modos.map((item) => (
            <button
              key={item.id}
              type="button"
              className={modo === item.id ? 'active' : ''}
              onClick={() => selecionarModo(item.id)}
              disabled={emAndamento || fimDoCiclo}
            >
              <span>{item.nome}</span>
              <small>{item.duracao}</small>
            </button>
          ))}
        </div>

        <div className="pomodoro-timer">
          <div className="pomodoro-progress">
            <svg viewBox="0 0 240 240">
              <circle className="pomodoro-track" cx="120" cy="120" r="108" />
              <circle
                className="pomodoro-progress-circle"
                cx="120"
                cy="120"
                r="108"
                style={{
                  strokeDasharray: 678.58,
                  strokeDashoffset: 678.58 * (1 - progresso),
                }}
              />
            </svg>

            <div className="pomodoro-time">
              <span>{formatarTempo(tempoRestante)}</span>
              <small>
                {modo === 'foco'
                  ? 'TEMPO DE FOCO'
                  : modo === 'pausaCurta'
                    ? 'PAUSA CURTA'
                    : 'PAUSA LONGA'}
              </small>
            </div>
          </div>
        </div>

        <div className="pomodoro-controls">
          {!emAndamento ? (
            <button
              type="button"
              className="pomodoro-start"
              onClick={iniciar}
              disabled={fimDoCiclo}
            >
              Iniciar
            </button>
          ) : (
            <button
              type="button"
              className="pomodoro-start"
              onClick={pausar}
            >
              Pausar
            </button>
          )}

          <button
            type="button"
            className="pomodoro-reset"
            onClick={reiniciar}
          >
            Reiniciar
          </button>
        </div>

        <p className="pomodoro-description">
          {emAndamento
            ? 'Mantenha o foco. Seu tempo está contando.'
            : fimDoCiclo
              ? 'Seu ciclo terminou. Confira o alerta.'
              : 'Quando estiver pronto, inicie seu ciclo.'}
        </p>
      </section>
    </main>
  );
}
