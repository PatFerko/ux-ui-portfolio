import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface TypingAnimationProps {
  skills: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function TypingAnimation({
  skills,
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 1500,
}: TypingAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState('');
  const [skillIndex, setSkillIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');

  useEffect(() => {
    if (prefersReducedMotion) {
      // Just show the first skill statically
      setDisplayText(skills[0] ?? '');
      return;
    }

    if (skills.length === 0) return;

    const currentSkill = skills[skillIndex % skills.length];

    if (phase === 'typing') {
      if (displayText.length < currentSkill.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentSkill.slice(0, displayText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setPhase('pausing'), pauseDuration);
        return () => clearTimeout(timeout);
      }
    }

    if (phase === 'pausing') {
      const timeout = setTimeout(() => setPhase('deleting'), 0);
      return () => clearTimeout(timeout);
    }

    if (phase === 'deleting') {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setSkillIndex((i) => (i + 1) % skills.length);
        setPhase('typing');
      }
    }
  }, [displayText, phase, skillIndex, skills, typingSpeed, deletingSpeed, pauseDuration, prefersReducedMotion]);

  return (
    <span className="inline-flex items-center text-indigo-500 dark:text-indigo-400 font-semibold" aria-live="polite" aria-atomic="true">
      {displayText}
      {!prefersReducedMotion && (
        <motion.span
          className="ml-0.5 inline-block w-0.5 h-[1em] bg-indigo-500 dark:bg-indigo-400"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </span>
  );
}
