import { Button } from "./button";
import { cn } from "../lib/utils";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

// Boutons sociaux avec effet glass
export function GlassSocialButtons() {
  const socialLinks = [
    {
      href: "https://github.com/winvdaking",
      label: "GitHub",
      className:
        "text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white",
      icon: <Github className="w-5 h-5" />,
    },
    {
      href: "https://linkedin.com/in/winvdaking",
      label: "LinkedIn",
      className: "text-blue-600 hover:text-blue-700",
      icon: <Linkedin className="w-5 h-5" />,
    },
    {
      href: "mailto:hello@dorianlopez.fr",
      label: "Email",
      className: "text-red-600 hover:text-red-700",
      icon: <EnvelopeIcon className="w-5 h-5" />,
    },
    {
      href: "https://discord.com/users/winv",
      label: "Discord",
      className: "text-indigo-600 hover:text-indigo-700",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-3">
      {socialLinks.map((social, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5, y: -2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
          className="group"
        >
          <Button
            variant="glass"
            size="icon"
            asChild
            className="w-10 h-10 group-hover:shadow-xl group-hover:shadow-black/30 group-hover:border-white/60 border border-border"
          >
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={cn(
                "flex items-center justify-center",
                social.className
              )}
            >
              <div className="group-hover:scale-110 transition-transform duration-200">
                {social.icon}
              </div>
            </a>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
