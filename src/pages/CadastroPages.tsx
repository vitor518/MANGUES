import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, Smile, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const avatarsDisponiveis = [
  '🦀', '🦢', '🌳', '🐋', '🦩', '🐦', '🦪', '🦐', '🌿', '🐬', '🐤', '🐙', '🐊', '🦋', '🐟'
];

export function CadastroPage() {
  const navigate = useNavigate();
  const { cadastro } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    apelido: '',
    senha: '',
    confirmarSenha: '',
    avatar: '🦀'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Limpar erro do campo ao digitar
    if (errors[e.target.name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'O nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.apelido.trim()) {
      newErrors.apelido = 'O apelido é obrigatório';
    } else if (formData.apelido.trim().length < 3) {
      newErrors.apelido = 'O apelido deve ter pelo menos 3 caracteres';
    }

    if (!formData.senha) {
      newErrors.senha = 'A senha é obrigatória';
    } else if (formData.senha.length < 4) {
      newErrors.senha = 'A senha deve ter pelo menos 4 caracteres';
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Por favor, confirme sua senha';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await cadastro({
        nome: formData.nome.trim(),
        apelido: formData.apelido.trim(),
        senha: formData.senha,
        avatar: formData.avatar
      });
      navigate('/');
    } catch (err: any) {
      setErrors({ submit: err.message || 'Erro ao criar conta' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{formData.avatar}</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-600">
            Junte-se a nós na exploração dos mangues!
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Picker */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Smile className="h-4 w-4 inline mr-2" />
                Escolha seu Avatar
              </label>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-green-500 transition-all flex items-center justify-between"
              >
                <span className="text-4xl">{formData.avatar}</span>
                <span className="text-sm text-gray-600">Clique para mudar</span>
              </button>
              
              {showAvatarPicker && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl grid grid-cols-5 gap-3">
                  {avatarsDisponiveis.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, avatar }));
                        setShowAvatarPicker(false);
                      }}
                      className={`text-3xl p-3 rounded-lg hover:bg-white hover:scale-110 transition-all ${
                        formData.avatar === avatar ? 'bg-green-100 ring-2 ring-green-500' : 'bg-white'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-bold text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Seu Nome
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Como você se chama?"
                disabled={loading}
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.nome}
                </p>
              )}
            </div>

            {/* Apelido */}
            <div>
              <label htmlFor="apelido" className="block text-sm font-bold text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Escolha um Apelido
              </label>
              <input
                type="text"
                id="apelido"
                name="apelido"
                value={formData.apelido}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  errors.apelido ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Seu apelido único"
                disabled={loading}
              />
              {errors.apelido && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.apelido}
                </p>
              )}
              {!errors.apelido && formData.apelido.length >= 3 && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ótimo apelido!
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-bold text-gray-700 mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Crie uma Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  errors.senha ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Pelo menos 4 caracteres"
                disabled={loading}
              />
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.senha}
                </p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-bold text-gray-700 mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Confirme sua Senha
              </label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  errors.confirmarSenha ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Digite a senha novamente"
                disabled={loading}
              />
              {errors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmarSenha}
                </p>
              )}
              {!errors.confirmarSenha && formData.confirmarSenha && formData.senha === formData.confirmarSenha && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  As senhas coincidem!
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 
                       transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Criar Conta</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-green-600 font-bold hover:text-green-700 hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}