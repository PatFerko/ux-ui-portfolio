import { motion, useReducedMotion } from 'framer-motion';
import { Layers, Zap, Palette } from 'lucide-react';

export function DraggableUIPreview() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      drag={!prefersReducedMotion}
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="relative w-64 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border border-gray-200/60 dark:border-gray-700/60 p-5 cursor-grab select-none"
      aria-label="Draggable UI preview widget — drag me around"
      role="presentation"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">ui-preview.tsx</span>
      </div>

      {/* Mock UI rows */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Layers size={14} className="text-indigo-500" />
          </div>
          <div className="flex-1">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-1.5" />
            <div className="h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full w-1/2" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <Palette size={14} className="text-purple-500" />
          </div>
          <div className="flex-1">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 mb-1.5" />
            <div className="h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full w-5/12" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Zap size={14} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5 mb-1.5" />
            <div className="h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full w-1/3" />
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500" />
          ))}
        </div>
        <motion.div
          className="w-16 h-5 rounded-full bg-indigo-500 dark:bg-indigo-600"
          animate={prefersReducedMotion ? {} : { opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Drag hint */}
      <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
        {prefersReducedMotion ? 'UI Preview' : '✦ drag me'}
      </p>
    </motion.div>
  );
}
