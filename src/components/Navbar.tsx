import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Users, Network, AlertTriangle, Gamepad2, Puzzle, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Início', icon: Leaf },
  { path: '/biodiversidade', label: 'Vida', icon: Leaf },
  { path: '/estrutura', label: 'Estrutura', icon: Network },
  { path: '/ameacas', label: 'Cuidados', icon: AlertTriangle },
  // Jogos separados e destacados
  { path: '/jogo-da-memoria', label: 'Memória', icon: Gamepad2, highlight: 'purple' },
  { path: '/jogo-conexoes', label: 'Conexões', icon: Puzzle, highlight: 'indigo' },
  { path: '/contatos', label: 'Equipe', icon: Users },
];

export function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Responsivo: fecha menu ao navegar
  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl border-b-4 border-green-500">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8" />
            <span className="text-xl font-bold">🌳 Mundo dos Mangues 🦀</span>
          </div>
          {/* Botão Hamburger para mobile */}
          <button
            className="md:hidden flex items-center p-2 rounded-lg hover:bg-green-800 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              // Destaque para jogos
              const highlight =
                item.highlight === 'purple'
                  ? 'hover:bg-purple-700'
                  : item.highlight === 'indigo'
                  ? 'hover:bg-indigo-700'
                  : 'hover:bg-green-600';
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                    isActive
                      ? 'bg-green-800 text-white shadow-lg ring-2 ring-green-400'
                      : `text-green-100 ${highlight} hover:text-white hover:shadow-md`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        {/* Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden mt-2 pb-2">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const highlight =
                  item.highlight === 'purple'
                    ? 'hover:bg-purple-700'
                    : item.highlight === 'indigo'
                    ? 'hover:bg-indigo-700'
                    : 'hover:bg-green-600';
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-green-800 text-white shadow-lg ring-2 ring-green-400'
                        : `text-green-100 ${highlight} hover:text-white hover:shadow-md`
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}