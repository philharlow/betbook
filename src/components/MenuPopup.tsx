import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { useUIState } from '../store/uiStore';

const MenuPopupDiv = styled.div`
  background: #0007;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
`;

const MenuDiv = styled.div`
  background-color: var(--black);
  display: flex;
  flex-direction: column;
  padding: 15px;
  width: fit-content;
  gap: 10px;
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

  if (!menuOpen) return null;
  return (
    <MenuPopupDiv onClick={() => setMenuOpen(false)}>
        <MenuDiv>
        <MenuOption onClick={onHome}>My Bets</MenuOption>
        <MenuOption onClick={onStats}>Stats</MenuOption>
        <MenuOption onClick={onSettings}>Settings</MenuOption>
        </MenuDiv>
    </MenuPopupDiv>
  );
}

export default MenuPopup;
