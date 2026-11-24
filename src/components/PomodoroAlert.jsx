
import { usePomodoro } from '../contexts/PomodoroContext';
import './PomodoroAlert.css';

export default function PomodoroAlert() {
  const { modo, fimDoCiclo, encerrarAlerta, selecionarModo } = usePomodoro();

  if (!fimDoCiclo) return null;

  const terminouFoco = modo === 'foco';

  function iniciarPausa(tipo) {
    encerrarAlerta();
    selecionarModo(tipo);
  }

  return (
    <div className="pomodoro-alert-overlay">
      <div
        className="pomodoro-alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pomodoro-alert-title"
      >
        <div className="pomodoro-alert-icon">
          {terminouFoco ? '✓' : '◷'}
        </div>

        <h2 id="pomodoro-alert-title">
          {terminouFoco ? 'Tempo de foco concluído!' : 'Pausa concluída!'}
        </h2>

        <p>
          {terminouFoco
            ? 'Você concluiu seu ciclo de concentração. Que tal fazer uma pausa?'
            : 'Sua pausa terminou. Está pronto para voltar aos estudos?'}
        </p>

        <div className="pomodoro-alert-actions">
          {terminouFoco ? (
            <>
              <button
                type="button"
                onClick={() => iniciarPausa('pausaCurta')}
              >
                Pausa curta
              </button>

              <button
                type="button"
                onClick={() => iniciarPausa('pausaLonga')}
              >
                Pausa longa
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => iniciarPausa('foco')}
            >
              Voltar ao foco
            </button>
          )}

          <button
            type="button"
            className="pomodoro-alert-dismiss"
            onClick={encerrarAlerta}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
