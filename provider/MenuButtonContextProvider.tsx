import React, { createContext, useContext, useState } from "react";

type MenuButton = {
  isMenuOpen: boolean;
  onMenuToggle: Function;
};

// create context
const MenuButtonContext = createContext<MenuButton>({
  isMenuOpen: false,
  onMenuToggle: () => {},
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
      }}
    >
      {children}
    </MenuButtonContext.Provider>
  );
};
