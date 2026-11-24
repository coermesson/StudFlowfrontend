
import { createContext, useContext, useEffect, useState } from 'react';

const PomodoroContext = createContext(null);

const TEMPOS = {
  foco: 25 * 60,
  pausaCurta: 5 * 60,
  pausaLonga: 15 * 60,
};

export function PomodoroProvider({ children }) {
  const [modo, setModo] = useState('foco');
  const [tempoRestante, setTempoRestante] = useState(TEMPOS.foco);
  const [emAndamento, setEmAndamento] = useState(false);
  const [fimDoCiclo, setFimDoCiclo] = useState(false);
  const [fimEm, setFimEm] = useState(null);

  useEffect(() => {
    if (!emAndamento || !fimEm) return;

    function atualizarTempo() {
      const restante = Math.max(
        0,
        Math.ceil((fimEm - Date.now()) / 1000)
      );

      setTempoRestante(restante);

      if (restante === 0) {
        setEmAndamento(false);
        setFimEm(null);
        setFimDoCiclo(true);
      }
    }

    atualizarTempo();

    const intervalo = setInterval(atualizarTempo, 250);

    return () => clearInterval(intervalo);
  }, [emAndamento, fimEm]);

  function iniciar() {
    if (fimDoCiclo || emAndamento) return;

    setFimEm(Date.now() + tempoRestante * 1000);
    setEmAndamento(true);
  }

  function pausar() {
    if (!emAndamento) return;

    const restante = Math.max(
      0,
      Math.ceil((fimEm - Date.now()) / 1000)
    );

    setTempoRestante(restante);
    setEmAndamento(false);
    setFimEm(null);

    if (restante === 0) {
      setFimDoCiclo(true);
    }
  }

  function reiniciar() {
    setEmAndamento(false);
    setFimEm(null);
    setFimDoCiclo(false);
    setTempoRestante(TEMPOS[modo]);
  }

  function selecionarModo(novoModo) {
    if (emAndamento) return;

    setModo(novoModo);
    setTempoRestante(TEMPOS[novoModo]);
    setFimDoCiclo(false);
    setFimEm(null);
  }

  function encerrarAlerta() {
    setFimDoCiclo(false);
  }

  return (
    <PomodoroContext.Provider
      value={{
        modo,
        tempoRestante,
        emAndamento,
        fimDoCiclo,
        iniciar,
        pausar,
        reiniciar,
        selecionarModo,
        encerrarAlerta,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const contexto = useContext(PomodoroContext);

  if (!contexto) {
    throw new Error(
      'usePomodoro deve ser utilizado dentro de PomodoroProvider.'
    );
  }

  return contexto;
}
