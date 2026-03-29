import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/**
 * DesignPlayground — lazy-loaded interactive UI component sandbox.
 * Lets visitors manipulate a small set of UI controls to experience
 * the designer's component craft first-hand.
 */
export function DesignPlayground() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [btnVariant, setBtnVariant] = useState<'primary' | 'secondary' | 'ghost'>('primary');
  const [radius, setRadius] = useState(8);
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [isToggled, setIsToggled] = useState(false);

  const isDark = theme === 'dark';

  const btnStyles: Record<typeof btnVariant, string> = {
    primary: `text-white`,
    secondary: `border-2 bg-transparent`,
    ghost: `bg-transparent underline`,
  };

  return (
    <div
      className={`p-6 rounded-2xl space-y-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
      aria-label="Design Playground"
    >
      <h3 className="text-lg font-bold">Design Playground</h3>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Manipulate these controls to explore component variations.
      </p>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Button variant */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Button Variant
          </label>
          <div className="flex gap-2 flex-wrap">
            {(['primary', 'secondary', 'ghost'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setBtnVariant(v)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors
                  ${btnVariant === v
                    ? 'bg-indigo-500 text-white'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Border radius */}
        <div className="space-y-2">
          <label
            htmlFor="playground-radius"
            className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Border Radius: {radius}px
          </label>
          <input
            id="playground-radius"
            type="range"
            min={0}
            max={32}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Accent color */}
        <div className="space-y-2">
          <label
            htmlFor="playground-color"
            className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Accent Color
          </label>
          <input
            id="playground-color"
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        {/* Toggle */}
        <div className="space-y-2">
          <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Toggle State
          </span>
          <button
            role="switch"
            aria-checked={isToggled}
            onClick={() => setIsToggled((t) => !t)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
            style={{ backgroundColor: isToggled ? accentColor : isDark ? '#374151' : '#d1d5db' }}
          >
            <motion.span
              className="inline-block h-4 w-4 rounded-full bg-white shadow"
              animate={{ x: isToggled ? 22 : 2 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Live Preview
        </p>
        <motion.button
          className={`px-5 py-2 font-medium text-sm transition-all ${btnStyles[btnVariant]}`}
          style={{
            borderRadius: radius,
            backgroundColor: btnVariant === 'primary' ? accentColor : undefined,
            borderColor: btnVariant === 'secondary' ? accentColor : undefined,
            color: btnVariant !== 'primary' ? accentColor : undefined,
          }}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        >
          Click me
        </motion.button>
      </div>
    </div>
  );
}
