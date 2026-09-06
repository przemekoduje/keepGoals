import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserProfilesProvider } from "./contexts/UserProfilesContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Goals } from "./pages/Goals";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Trash } from "./pages/Trash";
import { Settings } from "./pages/Settings";
import { Delegated } from "./pages/Delegated";
import { SharedNoteView } from "./pages/SharedNoteView";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";

function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

  return (
    <AuthProvider>
      <UserProfilesProvider>
        <Router basename={basename}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/delegated" element={<Delegated />} />
            </Route>
            <Route path="/shared/:shareToken" element={<SharedNoteView />} />
          </Routes>
        </Router>
      </UserProfilesProvider>
    </AuthProvider>
  );
}

export default App;
