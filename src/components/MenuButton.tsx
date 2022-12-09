import React from 'react';
import styled from 'styled-components/macro';
import { useUIState } from '../store/uiStore';

const MenuButtonDiv = styled.button`
  background: unset;
  border: unset;
  padding: 3px;
`;

function MenuButton() {
  const setMenuOpen = useUIState(state => state.setMenuOpen);
  
  const openMenu = () => {
    setMenuOpen(true);
  };

  return (
    <MenuButtonDiv onClick={openMenu}>
        <svg fill='white' viewBox="0 0 100 70" width="25" height="25">
          <rect y="0" width="80" height="10" rx="5"></rect>
          <rect y="30" width="80" height="10" rx="5"></rect>
          <rect y="60" width="80" height="10" rx="5"></rect>
        </svg>
    </MenuButtonDiv>
  );
}

export default MenuButton;
