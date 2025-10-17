import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import { 
  Trophy, Star, Target, Clock, Award, Edit2, Save, X, 
  TrendingUp, Gamepad2, Eye, Shield, Calendar, LogOut
} from 'lucide-react';

const avatarsDisponiveis = [
  '🦀', '🦢', '🌳', '🐋', '🦩', '🐦', '🦪', '🦐', '🌿', '🐬', '🐤', '🐙', '🐊', '🦋', '🐟'
];

export function PerfilPage() {
  const navigate = useNavigate();
  const { usuario, logout, atualizarPerfil, isAuthenticated } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [avatarSelecionado, setAvatarSelecionado] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome);
      setAvatarSelecionado(usuario.avatar);
    }
  }, [usuario]);

  const handleSalvarPerfil = async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/perfil/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          avatar: avatarSelecionado
        }),
      });

      if (response.ok) {
        await atualizarPerfil();
        setEditando(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (usuario) {
      setNome(usuario.nome);
      setAvatarSelecionado(usuario.avatar);
    }
    setEditando(false);
    setShowAvatarPicker(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para ver esta página</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-blue-600"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        {/* Header do Perfil */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="text-8xl bg-gradient-to-br from-green-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center">
                {editando ? avatarSelecionado : usuario.avatar}
              </div>
              {editando && (
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shadow-lg"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Info do Usuário */}
            <div className="flex-1 text-center md:text-left">
              {editando ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="text-3xl font-bold text-gray-800 border-2 border-gray-300 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSalvarPerfil}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 font-bold"
                    >
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={handleCancelar}
                      className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 font-bold"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">{usuario.nome}</h1>
                  <p className="text-xl text-gray-600 mb-4">@{usuario.apelido}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                    <div className="bg-yellow-100 px-4 py-2 rounded-full flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span className="font-bold text-yellow-700">{usuario.total_pontos} pontos</span>
                    </div>
                    <div className="bg-purple-100 px-4 py-2 rounded-full flex items-center space-x-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="font-bold text-purple-700">{usuario.conquistas?.length || 0} conquistas</span>
                    </div>
                    <div className="bg-blue-100 px-4 py-2 rounded-full flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-blue-700">{usuario.visitas} visitas</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <button
                      onClick={() => setEditando(true)}
                      className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 font-bold"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Editar Perfil</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 font-bold"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Data de Cadastro */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">Membro desde</p>
              <p className="text-lg font-bold text-gray-800">
                {formatarData(usuario.data_criacao)}
              </p>
            </div>
          </div>

          {/* Seletor de Avatar */}
          {showAvatarPicker && editando && (
            <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Escolha seu novo avatar:</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {avatarsDisponiveis.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => {
                      setAvatarSelecionado(avatar);
                      setShowAvatarPicker(false);
                    }}
                    className={`text-4xl p-4 rounded-xl hover:bg-white hover:scale-110 transition-all ${
                      avatarSelecionado === avatar ? 'bg-green-100 ring-2 ring-green-500' : 'bg-white'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-bold text-gray-800">Exploração</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Espécies vistas</span>
                <span className="font-bold text-green-600">
                  {usuario.estatisticas?.especies_visualizadas?.length || 0}/15
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ameaças conhecidas</span>
                <span className="font-bold text-orange-600">
                  {usuario.estatisticas?.ameacas_visualizadas?.length || 0}/8
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Gamepad2 className="h-6 w-6 text-purple-500" />
              <h3 className="text-xl font-bold text-gray-800">Jogos</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Memória</span>
                <span className="font-bold text-purple-600">
                  {(usuario.estatisticas?.jogos?.memoria?.facil?.jogos_completos || 0) +
                   (usuario.estatisticas?.jogos?.memoria?.medio?.jogos_completos || 0) +
                   (usuario.estatisticas?.jogos?.memoria?.dificil?.jogos_completos || 0)} jogos
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conexões</span>
                <span className="font-bold text-indigo-600">
                  {usuario.estatisticas?.jogos?.conexoes?.jogos_completos || 0} jogos
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-bold text-gray-800">Recordes</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Memória (melhor)</span>
                <span className="font-bold text-blue-600">
                  {Math.max(
                    usuario.estatisticas?.jogos?.memoria?.facil?.melhor_pontuacao || 0,
                    usuario.estatisticas?.jogos?.memoria?.medio?.melhor_pontuacao || 0,
                    usuario.estatisticas?.jogos?.memoria?.dificil?.melhor_pontuacao || 0
                  )} pts
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conexões (melhor)</span>
                <span className="font-bold text-green-600">
                  {usuario.estatisticas?.jogos?.conexoes?.melhor_pontuacao || 0} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Award className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-800">Minhas Conquistas</h2>
          </div>

          {usuario.conquistas && usuario.conquistas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usuario.conquistas.map((conquista: any) => (
                <div
                  key={conquista.id}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 hover:shadow-lg transition-shadow"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">{conquista.emoji}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {conquista.nome}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {conquista.descricao}
                    </p>
                    <div className="bg-yellow-200 px-4 py-2 rounded-full inline-flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-700" />
                      <span className="font-bold text-yellow-700">+{conquista.pontos} pontos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Ainda não há conquistas
              </h3>
              <p className="text-gray-600 mb-6">
                Continue explorando o mundo dos mangues para desbloquear conquistas incríveis!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:from-green-600 hover:to-blue-600"
              >
                Começar a Explorar
              </button>
            </div>
          )}
        </div>

        {/* Motivação */}
        <div className="mt-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Continue Explorando! 🌟</h2>
          <p className="text-xl mb-6">
            Você está indo muito bem! Cada ponto conquistado ajuda a proteger os mangues.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/biodiversidade')}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100"
            >
              Ver Espécies
            </button>
            <button
              onClick={() => navigate('/jogo-da-memoria')}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100"
            >
              Jogar Memória
            </button>
            <button
              onClick={() => navigate('/jogo-conexoes')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100"
            >
              Jogar Conexões
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}