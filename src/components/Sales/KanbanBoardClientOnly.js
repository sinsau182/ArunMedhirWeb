import React, { useEffect, useState } from 'react';
import KanbanBoard from './KanbanBoard';

const KanbanBoardClientOnly = (props) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;
  return <KanbanBoard {...props} />;
};

export default KanbanBoardClientOnly; 