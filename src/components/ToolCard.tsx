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
  figma: '🎨',
  react: '⚛️',
  framer: '🎬',
  tailwind: '🌊',
  typescript: '🔷',
  storybook: '📖',
  notion: '📝',
  miro: '🗺️',
  vscode: '💻',
  vercel: '▲',
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
      className={`relative group rounded-xl p-4 border cursor-default select-none
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

      {/* Hover-reveal description */}
      <motion.div
        className={`absolute inset-0 rounded-xl flex items-center justify-center p-3 text-center
          ${isDark ? 'bg-gray-900/95' : 'bg-indigo-50/95'}`}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        aria-hidden="true"
      >
        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {tool.description}
        </p>
      </motion.div>
    </motion.div>
  );
}
