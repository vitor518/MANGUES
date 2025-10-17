import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { BiodiversidadePage } from './pages/BiodiversidadePage';
import { EstruturaPage } from './pages/EstruturaPage';
import { AmeacasPage } from './pages/AmeacasPage';
import { JogoDaMemoria } from './pages/JogoDaMemoria';
import { JogoConexoes } from './pages/JogoConexoes';
import { ContatoFuncionalPage } from './pages/ContatoFuncionalPage';
import { LoginPage } from './pages/LoginPage';
import { CadastroPage } from './pages/CadastroPage';
import { PerfilPage } from './pages/PerfilPage';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />

              {/* Página Vida/Biodiversidade */}
              <Route path="/biodiversidade" element={<BiodiversidadePage />} />

              {/* Página Estrutura */}
              <Route path="/estrutura" element={<EstruturaPage />} />

              {/* Página Cuidados/Ameaças */}
              <Route path="/ameacas" element={<AmeacasPage />} />

              {/* Páginas de Jogos */}
              <Route path="/jogo-da-memoria" element={<JogoDaMemoria />} />
              <Route path="/jogo-conexoes" element={<JogoConexoes />} />

              {/* Página Contatos */}
              <Route path="/contatos" element={<ContatoFuncionalPage />} />

              {/* Páginas de Autenticação */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              <Route path="/perfil" element={<PerfilPage />} />

              {/* Rota 404 - redireciona para home se página não encontrada */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;