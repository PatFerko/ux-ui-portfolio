import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface Tool {
  name: string;
  icon: string;
  description: string;
}

// Simple icon map using text/emoji fallbacks for tools
const ICON_MAP: Record<string, string> = {
  figma: '\u{1F3A8}',
  github: '\u{1F419}',
  html: '\u{1F310}',
  css: '\u{1F58C}\u{FE0F}',
  bootstrap: '\u{1F4E6}',
  vscode: '\u{1F4BB}',
  vercel: '\u{25B2}',
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'dark';
  const icon = ICON_MAP[tool.icon] ?? '🔧';

  return (
    <motion.div
      className={`relative group rounded-xl p-4 border cursor-default select-none w-28
        ${isDark
          ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
          : 'bg-white border-gray-200 hover:border-indigo-400'
        } transition-colors`}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Icon + name */}
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl" role="img" aria-label={tool.name}>
          {icon}
        </span>
        <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {tool.name}
        </span>
      </div>
    </motion.div>
  );
}
