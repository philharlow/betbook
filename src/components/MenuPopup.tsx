import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { useUIState } from '../store/uiStore';

const MenuPopupDiv = styled.div`
  background-color: unset;
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  z-index: 10;
  transition: background-color 0.3s ease;
  &.open {
    width: 100%;
    background-color: #0007;
  }
`;

const MenuDiv = styled.div`
  background-color: var(--black);
  display: flex;
  flex-direction: column;
  padding: 15px;
  width: fit-content;
  gap: 10px;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  &.open {
    transform: unset;
  }
`;

const MenuOption = styled.div`
  background: var(--grey);
  font-size: 20px;
  padding: 20px 45px;
`;

function MenuPopup() {
  const navigate = useNavigate();
  const menuOpen = useUIState(state => state.menuOpen);
  const setMenuOpen = useUIState(state => state.setMenuOpen);
  
  const closeModal = () => {
    setMenuOpen(false);
  };

  const onHome = () => {
    closeModal();
    navigate("/");
  };

  const onSettings = () => {
    closeModal();
    navigate("/settings");
  };

  const onStats = () => {
    closeModal();
    navigate("/stats");
  };

  const onSearch = () => {
    closeModal();
    navigate("/search");
  };

  const className = menuOpen ? "open" : "";
  return (
    <MenuPopupDiv className={className} onClick={() => setMenuOpen(false)}>
        <MenuDiv className={className}>
          <MenuOption onClick={onHome}>My Bets</MenuOption>
          <MenuOption onClick={onSearch}>Search</MenuOption>
          <MenuOption onClick={onStats}>Stats</MenuOption>
          <MenuOption onClick={onSettings}>Settings</MenuOption>
        </MenuDiv>
    </MenuPopupDiv>
  );
}

export default MenuPopup;
