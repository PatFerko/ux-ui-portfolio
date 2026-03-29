import '@testing-library/jest-dom'

// jsdom doesn't implement IntersectionObserver — provide a constructor stub
// so components using useLazyLoad don't throw in tests.
if (typeof IntersectionObserver === 'undefined') {
  const mockObserverInstance = {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {},
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = function IntersectionObserver() {
    return mockObserverInstance;
  };
}
