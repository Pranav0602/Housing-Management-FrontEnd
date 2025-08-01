// SockJS expects a global object which isn't available in browser environments
// This polyfill ensures SockJS works correctly with Vite
if (typeof global === 'undefined') {
  window.global = window;
}