import { createContext, useContext, useState, ReactNode } from 'react';

interface GarageContextType {
  garageLogo: string | null;
  setGarageLogo: (logo: string | null) => void;
}

const GarageContext = createContext<GarageContextType | undefined>(undefined);

export function GarageProvider({ children }: { children: ReactNode }) {
  const [garageLogo, setGarageLogo] = useState<string | null>(null);

  return (
    <GarageContext.Provider value={{ garageLogo, setGarageLogo }}>
      {children}
    </GarageContext.Provider>
  );
}

export function useGarage() {
  const context = useContext(GarageContext);
  if (context === undefined) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
} 