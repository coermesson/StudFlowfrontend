
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Header from './components/layout/Header/Header';
import PomodoroAlert from './components/PomodoroAlert';
import Courses from './pages/Courses/Courses';
import Kanban from './pages/Kanban/Kanban';
import KanbanBoard from './pages/KanbanBoard/KanbanBoard';
import Login from './pages/Login/Login';
import Pomodoro from './pages/Pomodoro/Pomodoro';
import Profile from './pages/Profile/Profile';
import Register from './pages/Register/Register';
import Resources from './pages/Resources/Resources';
import SubjectsList from './pages/SubjectsList/SubjectsList';
import Todo from './pages/Todo/Todo';
import TodoList from './pages/TodoList/TodoList';

function App() {
  const location = useLocation();
  const { usuario, carregando, sair } = useAuth();

  const estaSemHeader = ['/login', '/cadastro'].includes(location.pathname);

  if (carregando) {
    return <p>Verificando autenticação...</p>;
  }

  const estaAutenticado = Boolean(usuario);

  async function handleLogout() {
    try {
      await sair();
    } finally {
      // O estado de autenticação será atualizado pelo AuthContext.
    }
  }

  return (
    <>
      {!estaSemHeader && estaAutenticado && (
        <Header onLogout={handleLogout} />
      )}

      {estaAutenticado && <PomodoroAlert />}

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={estaAutenticado ? '/cursos' : '/login'}
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            estaAutenticado
              ? <Navigate to="/cursos" replace />
              : <Login />
          }
        />

        <Route
          path="/cadastro"
          element={
            estaAutenticado
              ? <Navigate to="/cursos" replace />
              : <Register />
          }
        />

        <Route
          path="/cursos"
          element={
            estaAutenticado
              ? <Courses />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/cursos/:id"
          element={
            estaAutenticado
              ? <SubjectsList />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/materias/:id"
          element={
            estaAutenticado
              ? <Resources />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/kanban"
          element={
            estaAutenticado
              ? <Kanban />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/kanban/:id"
          element={
            estaAutenticado
              ? <KanbanBoard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/todo"
          element={
            estaAutenticado
              ? <Todo />
              : <Navigate to="/login" replace />
          }
        />

        <Route
  path="/pomodoro"
  element={
    estaAutenticado
      ? <Pomodoro />
      : <Navigate to="/login" replace />
  }
/>

        <Route
          path="/perfil"
          element={
            estaAutenticado
              ? <Profile />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={estaAutenticado ? '/cursos' : '/login'}
              replace
            />
          }
        />

        <Route
  path="/kanban/:id"
  element={
    estaAutenticado
      ? <KanbanBoard />
      : <Navigate to="/login" replace />
  }
/>

    <Route
  path="/todo/:id"
  element={
    estaAutenticado
      ? <TodoList />
      : <Navigate to="/login" replace />
  }
/>
      </Routes>
    </>
  );
}

export default App;
