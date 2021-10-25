import React, { createContext, useContext, useState } from "react";

type MenuButtonContext = {
  isMenuOpen: boolean;
  onMenuToggle: Function;
  onMenuClose: Function;
  onMenuOpen: Function;
};

// create context
const MenuButtonContext = createContext<MenuButtonContext>({
  isMenuOpen: false,
  onMenuToggle: () => {},
  onMenuClose: () => {},
  onMenuOpen: () => {},
});

export const useMenuButtonContext = () => useContext(MenuButtonContext);

// context provider
export const MenuButtonContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMenuOpen, onMenuToggle] = useState(false)
  return (
    <MenuButtonContext.Provider
      value={{
        isMenuOpen,
        onMenuToggle: () => onMenuToggle(!isMenuOpen),
        onMenuClose: () => onMenuToggle(false),
        onMenuOpen: () => onMenuToggle(true),
      }}
    >
      {children}
    </MenuButtonContext.Provider>
  );
};
