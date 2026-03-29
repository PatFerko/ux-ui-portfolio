import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import skillsData from '../data/skills.json';
import toolsData from '../data/tools.json';
import { ToolCard } from '../components/ToolCard';
import { useTheme } from '../context/ThemeContext';

interface Skill {
  name: string;
  level: number;
}

interface SkillCategory {
  name: string;
  skills: Skill[];
}

type Mindset = 'designer' | 'developer';

const MAX_SKILLS = 12;

// ── Radar Chart ──────────────────────────────────────────────────────────────

interface RadarChartProps {
  skills: Skill[];
  isDark: boolean;
}

function RadarChart({ skills, isDark }: RadarChartProps) {
  const capped = skills.slice(0, MAX_SKILLS);
  const count = capped.length;
  if (count < 3) return null;

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const levels = 4;

  function polarToXY(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  const angleStep = 360 / count;

  // Grid polygons
  const gridPolygons = Array.from({ length: levels }, (_, i) => {
    const r = (maxR * (i + 1)) / levels;
    const pts = capped.map((_, idx) => {
      const { x, y } = polarToXY(idx * angleStep, r);
      return `${x},${y}`;
    });
    return pts.join(' ');
  });

  // Axis lines
  const axes = capped.map((_, idx) => {
    const { x, y } = polarToXY(idx * angleStep, maxR);
    return { x, y };
  });

  // Data polygon
  const dataPoints = capped.map((skill, idx) => {
    const r = (skill.level / 100) * maxR;
    return polarToXY(idx * angleStep, r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  // Label positions (slightly outside maxR)
  const labelR = maxR + 18;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-label="Skill radar chart"
      role="img"
      className="mx-auto"
    >
      {/* Grid */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke={isDark ? '#374151' : '#e5e7eb'}
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {axes.map((pt, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={pt.x}
          y2={pt.y}
          stroke={isDark ? '#374151' : '#e5e7eb'}
          strokeWidth="1"
        />
      ))}

      {/* Data area */}
      <path
        d={dataPath}
        fill={isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'}
        stroke="#6366f1"
        strokeWidth="2"
      />

      {/* Data points */}
      {dataPoints.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={3} fill="#6366f1" />
      ))}

      {/* Labels */}
      {capped.map((skill, idx) => {
        const { x, y } = polarToXY(idx * angleStep, labelR);
        const anchor = x < cx - 5 ? 'end' : x > cx + 5 ? 'start' : 'middle';
        return (
          <text
            key={idx}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="9"
            fill={isDark ? '#9ca3af' : '#6b7280'}
          >
            {skill.name}
          </text>
        );
      })}
    </svg>
  );
}

// ── Progress Bars (fallback / mobile) ────────────────────────────────────────

interface ProgressBarsProps {
  skills: Skill[];
  isDark: boolean;
  animate: boolean;
}

function ProgressBars({ skills, isDark, animate }: ProgressBarsProps) {
  const capped = skills.slice(0, MAX_SKILLS);
  return (
    <ul className="space-y-3 w-full" aria-label="Skill levels">
      {capped.map((skill) => (
        <li key={skill.name}>
          <div className="flex justify-between mb-1">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {skill.name}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {skill.level}%
            </span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <motion.div
              className="h-full rounded-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={animate ? { duration: 0.6, ease: 'easeOut' } : { duration: 0 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── MindsetToggle ─────────────────────────────────────────────────────────────

interface MindsetToggleProps {
  mindset: Mindset;
  onChange: (m: Mindset) => void;
  isDark: boolean;
}

function MindsetToggle({ mindset, onChange, isDark }: MindsetToggleProps) {
  return (
    <div
      role="group"
      aria-label="Mindset view toggle"
      className={`inline-flex rounded-full p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
    >
      {(['designer', 'developer'] as Mindset[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-pressed={mindset === m}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
            ${mindset === m
              ? 'bg-indigo-500 text-white shadow'
              : isDark
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {m === 'designer' ? '🎨 Designer' : '💻 Developer'}
        </button>
      ))}
    </div>
  );
}

// ── SkillsSection ─────────────────────────────────────────────────────────────

export function SkillsSection() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'dark';

  const [mindset, setMindset] = useState<Mindset>('designer');

  const categories = (skillsData as SkillCategory[]);

  // Designer view: UX + UI; Developer view: Frontend
  const visibleCategories =
    mindset === 'designer'
      ? categories.filter((c) => c.name === 'UX' || c.name === 'UI')
      : categories.filter((c) => c.name === 'Frontend');

  return (
    <section
      id="skills"
      className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      aria-labelledby="skills-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* <div className="mb-10 text-center">
          <p className={`text-sm font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
            Expertise
          </p>
          <h2
            id="skills-heading"
            className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Skills &amp; Tools
          </h2>
          <p className={`mt-3 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            A hybrid skill set spanning research, visual design, and production-ready frontend code.
          </p>
        </div> */}

        {/* Mindset Toggle */}
        {/* <div className="flex justify-center mb-10">
          <MindsetToggle mindset={mindset} onChange={setMindset} isDark={isDark} />
        </div> */}

        {/* Skill categories */}

        {/* Tool stack */}
        <div>
          <h3 className={`text-xl font-semibold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Tool Stack
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(toolsData as { name: string; icon: string; description: string }[]).map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
