import { Sun, Moon, Infinity as InfinityIcon } from "lucide-react";

export function Header({ isDark, onToggleTheme }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 navbar-glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
            <InfinityIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">dlpz.fr</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-3 rounded-xl transition-all duration-300"
          aria-label={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-blue-600" />
          )}
        </button>
      </div>
    </header>
  );
}
