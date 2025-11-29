import type { FC } from 'react'
import { Link } from 'react-router-dom'

const HomePage: FC = () => {
  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Главная</h1>

      <nav style={{ display: "grid", gap: 12 }}>
        <Link to="/users-management">Управление пользователями</Link>
        <Link to="/cities-management">Управление городами</Link>
        <Link to="/league-management">Управление лигами</Link>
        <Link to="/seasons-management">Управление сезонами</Link>
        <Link to="/teams-management">Управление командами и игроками</Link>
        <Link to="/competition-plan">План соревнований</Link>
        <Link to="/regulations">Регламент</Link>
        <Link to="/rules">Правила</Link>
        <Link to="/contacts">Контакты</Link>
      </nav>
    </main>
  );
}

export default HomePage
