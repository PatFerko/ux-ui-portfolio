import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

// Helper component to expose context values
function ThemeConsumer({ onRender }: { onRender: (v: { theme: string; toggle: () => void }) => void }) {
  const { theme, toggleTheme } = useTheme();
  onRender({ theme, toggle: toggleTheme });
  return null;
}

describe('ThemeController', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      storage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => storage[key] ?? null);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete storage[key];
    });
    // Reset html class
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light theme when localStorage is empty', () => {
    let captured: { theme: string; toggle: () => void } | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(v) => { captured = v; }} />
      </ThemeProvider>
    );
    expect(captured!.theme).toBe('light');
  });

  it('toggles from light to dark', () => {
    let captured: { theme: string; toggle: () => void } | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(v) => { captured = v; }} />
      </ThemeProvider>
    );
    expect(captured!.theme).toBe('light');
    act(() => { captured!.toggle(); });
    expect(captured!.theme).toBe('dark');
  });

  it('toggles from dark back to light', () => {
    let captured: { theme: string; toggle: () => void } | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(v) => { captured = v; }} />
      </ThemeProvider>
    );
    act(() => { captured!.toggle(); }); // light → dark
    act(() => { captured!.toggle(); }); // dark → light
    expect(captured!.theme).toBe('light');
  });

  it('applies "dark" class to <html> when theme is dark', () => {
    let captured: { theme: string; toggle: () => void } | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(v) => { captured = v; }} />
      </ThemeProvider>
    );
    act(() => { captured!.toggle(); });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes "dark" class from <html> when theme is light', () => {
    document.documentElement.classList.add('dark');
    let captured: { theme: string; toggle: () => void } | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(v) => { captured = v; }} />
      </ThemeProvider>
    );
    // starts light (no stored value), so dark class should be removed
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme to localStorage on toggle', () => {
    let captured: { theme: string; toggle: () => void } | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(v) => { captured = v; }} />
      </ThemeProvider>
    );
    act(() => { captured!.toggle(); });
    expect(storage['portfolio-theme']).toBe('dark');
  });

  it('restores persisted theme from localStorage on mount', () => {
    storage['portfolio-theme'] = 'dark';
    let captured: { theme: string; toggle: () => void } | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(v) => { captured = v; }} />
      </ThemeProvider>
    );
    expect(captured!.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
