
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './ProfileMenu.css';

function ProfileMenu({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const { usuario } = useAuth();

  function handleToggle() {
    setIsOpen((previousState) => !previousState);
  }

  function handleLogout() {
    setIsOpen(false);

    if (onLogout) {
      onLogout();
    }
  }

  return (
    <div className="profile-menu">
      <button
        className="profile-menu__trigger"
        type="button"
        onClick={handleToggle}
        aria-label="Abrir menu do perfil"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </button>

      {isOpen && (
        <div className="profile-menu__dropdown">
          <div className="profile-menu__user">
            {usuario?.nome}
          </div>

          <Link
            to="/perfil"
            className="profile-menu__item"
            onClick={() => setIsOpen(false)}
          >
            Editar perfil
          </Link>

          <button
            type="button"
            className="profile-menu__item profile-menu__logout"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
