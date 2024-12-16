import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Modal, useUIState } from '../store/uiStore';
import { TbReceipt, TbChartHistogram, TbPlus, TbSettings } from "react-icons/tb";


const MenuBarDiv = styled.div`
  background-color: #1a1a1a;
  display: flex;
  flex-direction: row;
  padding: 5px;
  width: 100%;
  height: 80px;
  gap: 10px;
  z-index: 10;
  @supports (hanging-punctuation: first) and (font: -apple-system-body) and (-webkit-appearance: none) {
    padding-bottom: 20px;
  }
`;

interface MenuButtonProps {
  selected?: boolean;
}

const MenuOption = styled.div<MenuButtonProps>`
  background-color: ${p => p.selected ? "#444" : "#1a1a1a"};
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  svg {
    flex: 1;
    width: unset;
    height: unset;
    padding: 2px;
  }
`;

const AddOption = styled(MenuOption)`
  border: 2px solid #868686;
  margin-top: -10px;
`;

const Spacer = styled.div`
  flex: 1;
`;

function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const setModalOpen = useUIState(state => state.setModalOpen);
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

  const addTicket = () => {
    setModalOpen(Modal.AddTicket);
  };

  let settingsSelected = location.pathname === "/settings";
  let statsSelected = location.pathname === "/stats";

  return (
    <MenuBarDiv onClick={() => setMenuOpen(false)}>
        <MenuOption selected={!statsSelected && !settingsSelected} onClick={onHome}><TbReceipt />My Bets</MenuOption>
        <MenuOption selected={statsSelected} onClick={onStats}><TbChartHistogram  />Stats</MenuOption>
        <AddOption onClick={addTicket}><TbPlus />Add</AddOption>
        <Spacer />
        <MenuOption selected={settingsSelected} onClick={onSettings}><TbSettings />Settings</MenuOption>
    </MenuBarDiv>
  );
}

export default MenuBar;
