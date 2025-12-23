import { type FC, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages";
import CompetitionPlanPage from "./pages/competition-plan";
import RegulationsPage from "./pages/regulations";
import RulesPage from "./pages/rules";
import ContactsPage from "./pages/contacts";
import LoginPage from "./pages/login";
import LeagueManagementPage from "./pages/league-management";
import SeasonsManagementPage from "./pages/seasons-management";
import CitiesManagementPage from "./pages/cities-management";
import UsersManagementPage from "./pages/users-management";
import TeamsManagementPage from "./pages/teams-management";
import TeamEditPage from "./pages/team-edit";
import VolleyballTeamEditPage from "./pages/volleyball-team-edit";
import SeasonEditPage from "./pages/season-edit";
import ReauthModal from "./components/ReauthModal";
import { useReauth } from "./contexts/ReauthContext";
import { setUnauthorizedCallback } from "./services/api";

const App: FC = () => {
  const { showReauthModal, hideReauthModal, isReauthModalOpen } = useReauth();

  // Устанавливаем callback для обработки 401 ошибок
  useEffect(() => {
    setUnauthorizedCallback(() => {
      showReauthModal();
    });
  }, [showReauthModal]);

  // Обработчик успешной повторной авторизации
  const handleReauthSuccess = () => {
    hideReauthModal();
    // Перезагружаем текущую страницу для повторной загрузки данных
    window.location.reload();
  };

  const handleReauthCancel = () => {
    hideReauthModal();
    // Опционально: можно редиректить на страницу логина
    // navigate('/login');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/league-management" element={<LeagueManagementPage />} />
        <Route path="/seasons-management" element={<SeasonsManagementPage />} />
        <Route path="/cities-management" element={<CitiesManagementPage />} />
        <Route path="/users-management" element={<UsersManagementPage />} />
        <Route path="/teams-management" element={<TeamsManagementPage />} />
        <Route path="/team-edit/:teamId" element={<TeamEditPage />} />
        <Route path="/volleyball-team-edit/:cityId/:teamId" element={<VolleyballTeamEditPage />} />
        <Route path="/season-edit/:seasonId/:sportType" element={<SeasonEditPage />} />
        <Route path="/competition-plan" element={<CompetitionPlanPage />} />
        <Route path="/regulations" element={<RegulationsPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
      </Routes>

      <ReauthModal
        open={isReauthModalOpen}
        onSuccess={handleReauthSuccess}
        onCancel={handleReauthCancel}
      />
    </>
  );
};

export default App;
