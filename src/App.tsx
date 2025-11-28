import type { FC } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages'
import CompetitionPlanPage from './pages/competition-plan'
import RegulationsPage from './pages/regulations'
import RulesPage from './pages/rules'
import ContactsPage from './pages/contacts'
import LoginPage from "./pages/login";
import LeagueManagementPage from "./pages/league-management";
import SeasonsManagementPage from "./pages/seasons-management";

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/league-management" element={<LeagueManagementPage />} />
      <Route path="/seasons-management" element={<SeasonsManagementPage />} />
      <Route path="/competition-plan" element={<CompetitionPlanPage />} />
      <Route path="/regulations" element={<RegulationsPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
    </Routes>
  );
}

export default App
