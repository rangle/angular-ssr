export const injectIntoDocument = (document: Document, javascript: string): void => {
  if (document.head == null) {
    const headElement = document.createElement('head');

    document.appendChild(headElement);
  }

  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.textContent = javascript;

  document.head.appendChild(script);
};