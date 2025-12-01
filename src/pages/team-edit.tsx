// llf-webview/src/pages/team-edit.tsx

import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ShirtIcon } from "../components/icons";

const TeamEditPage: FC = () => {
  const navigate = useNavigate();

  // TODO: Получить teamId из URL параметров
  // TODO: Загрузить данные команды по teamId

  // Заглушки для данных
  const teamName = "RED MACHINE";

  const handleBack = () => {
    navigate("/teams-management");
  };

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        right: 0,
        minHeight: "100vh",
        backgroundColor: "surface",
      }}
    >
      <Container maxWidth="md" sx={{ px: 0, pt: 0, pb: 10 }}>
        {/* Шапка с градиентом */}
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
            padding: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Кнопка назад */}
            <Box sx={{ marginBottom: 0 }}>
              <IconButton
                onClick={handleBack}
                sx={{
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>

            {/* Блок слева - иконка */}
            <Box
              sx={{
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
              }}
            >
              <ShirtIcon size={64} strokeColor="#FFFFFF" />
            </Box>

            {/* Блок справа - название команды */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                {teamName}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Контентная область - пока пустая */}
        <Box sx={{ padding: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Содержимое страницы редактирования команды в разработке...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default TeamEditPage;
