import React, { useState } from "react";
import styled from "styled-components/macro";
import { Button } from "../../styles/GlobalStyles";
import { useUIState } from "../../store/uiStore";
import Toggle from "../Toggle";

const SettingsViewDiv = styled.div`
  background-color: var(--black);
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 15px;
  gap: 25px;
`;

const Warning = styled.div`
  color: #cdcd24;
  font-size: 10px;
`;

const Group = styled.div`
  background-color: #222;
  font-size: 24px;
  padding: 24px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-self: center;
  align-items: center;
`;

const InputRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
`;

const SettingButton = styled(Button)<{ danger?: boolean }>`
  padding: 10px 20px;
  align-self: center;
  color: ${(props) => (props.danger ? "red" : "unset")};
`;

function UserView() {
  const startingBalance = useUIState((state) => state.startingBalance);
  const userName = useUIState((state) => state.userName);
  const setUserName = useUIState((state) => state.setUserName);
  const setStartingBalance = useUIState((state) => state.setStartingBalance);
  const [startingBalanceInput, setStartingBalanceInput] = useState("" + startingBalance);
  const [userNameInput, setUserNameInput] = useState(userName);

  const saveStartingBalance = () => {
    setStartingBalance(parseFloat(startingBalanceInput));
  };

  const saveUserName = () => {
    setUserName(userNameInput);
  };

  return (
    <SettingsViewDiv>
      <Content>
        <Group>
          User Name
          <InputRow>
            <input type="text" value={userNameInput} onChange={(e) => setUserNameInput(e.target.value)} />
            <SettingButton onClick={saveUserName}>Save</SettingButton>
          </InputRow>
        </Group>
        <Group>
          Balance
          <InputRow>
            Show balance
            <Toggle
              // label="Show balance"
              checked={useUIState((state) => state.showBalance)}
              onChecked={(checked) => useUIState.getState().setShowBalance(checked)}
            />
          </InputRow>
          <InputRow>
            <div>
              Starting Balance
              <div>
                $
                <input
                  type="number"
                  value={startingBalanceInput}
                  onChange={(e) => setStartingBalanceInput(e.target.value)}
                />
              </div>
            </div>
            <SettingButton onClick={saveStartingBalance}>Save</SettingButton>
          </InputRow>
          <Warning>Balance shown = Starting balance + net profit</Warning>
        </Group>
      </Content>
    </SettingsViewDiv>
  );
}

export default UserView;
