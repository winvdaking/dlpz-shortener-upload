import { Copy, Check, ExternalLink, Sparkles } from "lucide-react";

export function ResultCard({ url, onCopy, copied }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground font-poppins">
        <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        Lien court généré avec succès !
      </div>
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 truncate text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline flex items-center gap-1 transition-colors duration-200"
          >
            {url}
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onCopy}
            className="water-drop-button shrink-0 inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
