import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import { Modal, useUIState } from "../store/uiStore";
import { TbReceipt, TbChartHistogram, TbPlus, TbSettings, TbUserCircle } from "react-icons/tb";

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
  background-color: ${(p) => (p.selected ? "#444" : "#1a1a1a")};
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
  margin-top: -15px;
`;

function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const setModalOpen = useUIState((state) => state.setModalOpen);
  const userName = useUIState((state) => state.userName);

  let settingsSelected = location.pathname === "/settings";
  let statsSelected = location.pathname === "/stats";
  let userSelected = location.pathname === "/user";
  let homeSelected = !statsSelected && !settingsSelected && !userSelected;

  return (
    <MenuBarDiv>
      <MenuOption selected={homeSelected} onClick={() => navigate("/")}>
        <TbReceipt />
        My Bets
      </MenuOption>
      <MenuOption selected={statsSelected} onClick={() => navigate("/stats")}>
        <TbChartHistogram />
        Stats
      </MenuOption>
      <AddOption onClick={() => setModalOpen(Modal.AddTicket)}>
        <TbPlus />
        Add
      </AddOption>
      <MenuOption selected={userSelected} onClick={() => navigate("/user")}>
        <TbUserCircle />
        {userName}
      </MenuOption>
      <MenuOption selected={settingsSelected} onClick={() => navigate("/settings")}>
        <TbSettings />
        Settings
      </MenuOption>
    </MenuBarDiv>
  );
}

export default MenuBar;
