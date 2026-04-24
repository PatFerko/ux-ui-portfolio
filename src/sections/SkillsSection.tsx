import toolsData from '../data/tools.json';
import { ToolCard } from '../components/ToolCard';
import { useTheme } from '../context/ThemeContext';

export function SkillsSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="skills"
      className={`py-12 sm:py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      aria-labelledby="skills-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <h3 id="skills-heading" className={`text-xl font-semibold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Tool Stack
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {(toolsData as { name: string; icon: string; description: string }[]).map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
