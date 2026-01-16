import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { Box } from "@mui/material";

const HomePage: FC = () => {
  return (
    <main style={{ padding: 16 }}>
      <nav style={{ display: "grid", gap: 12 }}>
        <Link
          to="/cups-management"
          style={{ textDecoration: "none", color: "white" }}
        >
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.primary.main,
            }}
          >
            Управление Кубками
          </Box>
        </Link>
        <Link
          to="/users-management"
          style={{ textDecoration: "none", color: "white" }}
        >
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.primary.main,
            }}
          >
            Управление пользователями
          </Box>
        </Link>
        <Link
          to="/cities-management"
          style={{ textDecoration: "none", color: "white" }}
        >
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.primary.main,
            }}
          >
            Управление городами
          </Box>
        </Link>
        <Link
          to="/league-management"
          style={{ textDecoration: "none", color: "white" }}
        >
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.primary.main,
            }}
          >
            Управление лигами
          </Box>
        </Link>
        <Link
          to="/teams-management"
          style={{ textDecoration: "none", color: "white" }}
        >
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.primary.main,
            }}
          >
            Управление командами и игроками
          </Box>
        </Link>
        <Link
          to="/seasons-management"
          style={{ textDecoration: "none", color: "white" }}
        >
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.primary.main,
            }}
          >
            Управление сезонами
          </Box>
        </Link>
        <Link
          to="/competition-plan"
          style={{ textDecoration: "none", color: "white" }}
        >
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.secondary.main,
            }}
          >
            План соревнований
          </Box>
        </Link>
        <Link
          to="/regulations"
          style={{ textDecoration: "none", color: "white" }}
        >
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.secondary.main,
            }}
          >
            Регламент
          </Box>
        </Link>
        <Link to="/rules" style={{ textDecoration: "none", color: "white" }}>
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.secondary.main,
            }}
          >
            Правила
          </Box>
        </Link>
        <Link to="/contacts" style={{ textDecoration: "none", color: "white" }}>
          <Box
            sx={{
              borderRadius: 1,
              padding: 1.5,
              border: (theme) => `1px solid ${theme.palette.cardBorder}`,
              backgroundColor: (theme) => theme.palette.secondary.main,
            }}
          >
            Контакты
          </Box>
        </Link>
      </nav>
    </main>
  );
};

export default HomePage
