import { createContext, useContext } from 'react';

// Errors for fields by `path` ({ heading: 'Heading is required.' }): every field that names
// its `path` reads this and shows the error under its box, without each editor passing it down.
const ErrCtx = createContext({});

export function FieldErrors({ errors, children }) {
  return <ErrCtx.Provider value={errors}>{children}</ErrCtx.Provider>;
}

// The error for a field's path (or the first of its paths), if any.
export function useFieldError(path) {
  const errors = useContext(ErrCtx);
  if (!path) return null;
  return [].concat(path).map((p) => errors[p]).find(Boolean) || null;
}
