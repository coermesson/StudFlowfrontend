import { NavLink } from 'react-router-dom';
import studyFlowLogo from '../../../assets/logostudyflow.png';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import './Header.css';

const menuItems = [
  { key: 'kanban', label: 'Kanban', path: '/kanban' },
  { key: 'todo', label: 'ToDo', path: '/todo' },
  { key: 'pomodoro', label: 'Pomodoro', path: '/pomodoro' },
  { key: 'cursos', label: 'Cursos', path: '/cursos' },
];

function Header({ onLogout }) {
  return (
    <header className="header">
      <div className="header__brand">
        <img
          src={studyFlowLogo}
          alt="StudyFlow"
          className="header__logo"
        />
        <span className="header__brand-name">StudyFlow</span>
      </div>

      <nav className="header__navigation">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `header__link header__link--${item.key} ${
                isActive ? 'header__link--active' : ''
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="header__profile">
        <ProfileMenu onLogout={onLogout} />
      </div>
    </header>
  );
}

export default Header;