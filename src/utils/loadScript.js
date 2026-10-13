// Adds a <script> once per src and resolves when it has loaded (a failed load can be retried).
const loading = new Map();

export default function loadScript(src) {
  if (!loading.has(src)) {
    loading.set(src, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loading.delete(src);
        script.remove();
        reject(new Error(`couldn't load ${src}`));
      };
      document.head.appendChild(script);
    }));
  }
  return loading.get(src);
}
