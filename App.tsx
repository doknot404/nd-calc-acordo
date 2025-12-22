
import React from 'react';
import AgreementSimulator from './screens/AgreementSimulator';

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-background-dark overflow-hidden font-sans">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AgreementSimulator />
      </div>
    </div>
  );
};

export default App;
