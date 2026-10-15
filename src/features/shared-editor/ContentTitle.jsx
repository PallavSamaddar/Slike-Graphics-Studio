import { createContext, useContext } from 'react';

// Where the graphic stands (Published · v2 / Unpublished / On air), shown beside the editor's
// Content heading. The studio page provides it; each editor's content section titles itself
// with <ContentTitle>.
const AirStatusContext = createContext(null);
export const AirStatusProvider = AirStatusContext.Provider;

export default function ContentTitle({ children = 'Content' }) {
  const status = useContext(AirStatusContext);
  return (
    <span className="content-title">
      {children}
      {status}
    </span>
  );
}
