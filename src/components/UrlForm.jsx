import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'lucide-react';

const UrlForm = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Entrez votre URL à raccourcir..."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
            disabled={isLoading}
            required
          />
        </div>
        <motion.button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-white to-white text-black font-medium rounded-lg transition-all duration-200 hover:from-white hover:to-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <span>Raccourcissement...</span>
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              Raccourcir
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default UrlForm;
