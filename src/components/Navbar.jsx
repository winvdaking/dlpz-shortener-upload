export function Navbar({ language, onToggleLanguage }) {
  const getFlag = (lang) => {
    switch (lang) {
      case "fr":
        return "🇫🇷";
      case "en":
        return "🇬🇧";
      default:
        return "🌐";
    }
  };

  return (
    <nav className="relative pt-4 lg:pt-6 pb-4 z-50 navbar-border">
      <div className="navbar-container px-4 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Logo and avatar */}
          <div className="flex items-center gap-3">
            <div className="avatar-container w-8 h-8 lg:w-10 lg:h-10">
              <img
                src="/avatar.png"
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="avatar-fallback text-xs lg:text-sm"
                style={{ display: "none" }}
              >
                DL
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-adaptive font-semibold text-base lg:text-lg font-poppins">
                dorianlopez.fr
              </span>
              <span className="text-muted-adaptive text-xs lg:text-sm font-poppins">
                dlpz.fr
              </span>
            </div>
          </div>

          {/* Right side - Language flag only */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={onToggleLanguage}
              className="theme-toggle-button w-10 h-10 lg:w-12 lg:h-12 text-lg lg:text-xl"
              title={
                language === "fr" ? "Switch to English" : "Passer en Français"
              }
            >
              {getFlag(language)}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
