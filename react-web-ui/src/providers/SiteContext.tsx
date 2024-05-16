import React, { createContext, useContext, useState, ReactNode } from "react";

const SiteContext = createContext<
  [string, React.Dispatch<React.SetStateAction<string>>]
>(["", () => {}]);

export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSiteContext must be used within a SiteProvider");
  }
  return context;
};

export const SiteProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [itemSelected, setItemSelected] = useState("");

  return (
    <SiteContext.Provider value={[itemSelected, setItemSelected]}>
      {children}
    </SiteContext.Provider>
  );
};
