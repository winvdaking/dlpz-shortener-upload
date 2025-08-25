import { motion } from "framer-motion";

export const RadiantGrid = ({ children, className = "" }) => {
    return (
        <div className={`radiant-grid-container ${className}`}>
            {/* Grille de fond décorative */}
            <div className="radiant-grid-background">
                <div className="grid-lines"></div>
                <div className="grid-dots"></div>
                <div className="grid-corners"></div>
            </div>

            {/* Contenu principal */}
            <div className="radiant-grid-content">
                {children}
            </div>

            {/* Bordures décoratives */}
            <div className="radiant-borders">
                <div className="border-top"></div>
                <div className="border-right"></div>
                <div className="border-bottom"></div>
                <div className="border-left"></div>
                <div className="border-corners">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                </div>
            </div>
        </div>
    );
};

export const RadiantCard = ({ children, className = "", delay = 0 }) => {
    return (
        <motion.div
            className={`radiant-card ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
        >
            {/* Bordure animée */}
            <div className="card-border">
                <div className="border-gradient"></div>
            </div>

            {/* Contenu */}
            <div className="card-content">
                {children}
            </div>

            {/* Effet de brillance */}
            <div className="card-shine"></div>
        </motion.div>
    );
};

export const RadiantBorder = ({ children, className = "", variant = "default" }) => {
    const variants = {
        default: "radiant-border-default",
        gradient: "radiant-border-gradient",
        animated: "radiant-border-animated",
        glow: "radiant-border-glow"
    };

    return (
        <div className={`radiant-border ${variants[variant]} ${className}`}>
            <div className="border-effect"></div>
            <div className="border-content">
                {children}
            </div>
        </div>
    );
};
