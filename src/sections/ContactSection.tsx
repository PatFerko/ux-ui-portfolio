import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// ── Email validation (RFC 5322 simplified pattern) ────────────────────────────

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// ── Formspree submission (no server required) ─────────────────────────────────
// Replace with your Formspree form ID after creating one at https://formspree.io
// e.g. const FORMSPREE_URL = 'https://formspree.io/f/xyzabcde';
const FORMSPREE_URL = 'https://formspree.io/f/xnjopwzq';

async function submitForm(data: Omit<ContactFormData, 'honeypot'>): Promise<void> {
  const res = await fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Formspree error: ${res.status}`);
}

// ── Success animation ─────────────────────────────────────────────────────────

function SuccessAnimation({ isDark, animate }: { isDark: boolean; animate: boolean }) {
  const circleVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: animate
        ? { duration: 0.6, ease: 'easeInOut' as const }
        : { duration: 0 },
    },
  };

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: animate
        ? { duration: 0.4, ease: 'easeInOut' as const, delay: 0.5 }
        : { duration: 0 },
    },
  };

  const containerVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: animate
        ? { duration: 0.4, ease: 'easeOut' as const }
        : { duration: 0 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-6 py-12"
      role="status"
      aria-live="polite"
    >
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          stroke={isDark ? '#818cf8' : '#6366f1'}
          strokeWidth="4"
          variants={circleVariants}
          initial="hidden"
          animate="visible"
        />
        <motion.path
          d="M24 40 L35 51 L56 30"
          stroke={isDark ? '#818cf8' : '#6366f1'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={checkVariants}
          initial="hidden"
          animate="visible"
        />
      </motion.svg>
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Message sent!
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Thanks for reaching out. I'll get back to you soon.
        </p>
      </div>
    </motion.div>
  );
}

// ── ContactForm ───────────────────────────────────────────────────────────────

interface ContactFormProps {
  isDark: boolean;
  animate: boolean;
}

function ContactForm({ isDark, animate }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [submitError, setSubmitError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({ mode: 'onSubmit', reValidateMode: 'onChange' });

  const onSubmit = async (data: ContactFormData) => {
    // Honeypot check — silently reject if populated
    if (data.honeypot) {
      setStatus('idle');
      return;
    }

    setStatus('submitting');
    setSubmitError('');

    try {
      await submitForm({ name: data.name, email: data.email, message: data.message });
      setStatus('success');
    } catch {
      setStatus('error');
      setSubmitError('Something went wrong. Please try again or use the email link below.');
    }
  };

  if (status === 'success') {
    return <SuccessAnimation isDark={isDark} animate={animate} />;
  }

  const inputBase = `w-full rounded-xl px-4 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
    isDark
      ? 'bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-indigo-500'
      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-indigo-400'
  }`;

  const errorClass = `mt-1 text-xs text-red-500 dark:text-red-400`;

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Contact form">
      {/* Honeypot — hidden from real users */}
      <input
        {...register('honeypot')}
        type="text"
        name="honeypot"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ display: 'none' }}
      />

      {/* Name */}
      <div className="mb-5">
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          aria-invalid={!!errors.name}
          className={inputBase}
          {...register('name', { required: 'Name is required', validate: (v) => v.trim().length > 0 || 'Name is required' })}
        />
        {errors.name && (
          <p id="contact-name-error" className={errorClass} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="mb-5">
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          aria-invalid={!!errors.email}
          className={inputBase}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_REGEX, message: 'Please enter a valid email address' },
          })}
        />
        {errors.email && (
          <p id="contact-email-error" className={errorClass} role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="mb-6">
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Tell me about your project…"
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          aria-invalid={!!errors.message}
          className={`${inputBase} resize-none`}
          {...register('message', { required: 'Message is required', validate: (v) => v.trim().length > 0 || 'Message is required' })}
        />
        {errors.message && (
          <p id="contact-message-error" className={errorClass} role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={status === 'submitting'}
        whileHover={animate && status !== 'submitting' ? { scale: 1.02 } : undefined}
        whileTap={animate && status !== 'submitting' ? { scale: 0.98 } : undefined}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
          ${status === 'submitting'
            ? 'bg-indigo-400 cursor-not-allowed text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
          }`}
        aria-label={status === 'submitting' ? 'Sending message…' : 'Send message'}
      >
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            Sending…
          </span>
        ) : (
          'Send Message'
        )}
      </motion.button>

      {/* Submission error */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.p
            initial={animate ? { opacity: 0, y: -4 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animate ? 0.2 : 0 }}
            className="mt-3 text-sm text-red-500 dark:text-red-400 text-center"
            role="alert"
          >
            {submitError}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

// ── ContactSection ────────────────────────────────────────────────────────────

export function ContactSection() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'dark';
  const animate = !prefersReducedMotion;

  return (
    <section
      id="contact"
      className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      aria-labelledby="contact-heading"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className={`text-sm font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
            Contact
          </p>
          <h2
            id="contact-heading"
            className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Let's build something together…
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Have a project in mind? Drop me a message and I'll get back to you within a few days.
          </p>
        </div>

        {/* Form card */}
        <div className={`rounded-2xl p-8 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <ContactForm isDark={isDark} animate={animate} />
        </div>

        {/* Direct email alternative */}
        <p className={`mt-8 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Prefer email?{' '}
          <a
            href="mailto:pat.ferkova@gmail.com"
            className={`font-medium underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded
              ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
          >
            pat.ferkova@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}
