import React from 'react';
import styled from 'styled-components/macro';
import VersionDisplay from './VersionDisplay';

const TopBarDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 15px;
  height: 50px;
`;

const Title = styled.div`
  font-size: var(--topbar-font-size);
  font-weight: 400;
  display: flex;
  align-items: center;
`;


const Logo = styled.img`
  width: 35px;
  height: 25px;
  padding-right: 10px;
`;

const OffsetVersionDisplay = styled(VersionDisplay)`
  padding-left: 5px;
  padding-top: 13px;
`;

function TopBar() {
  return (
    <TopBarDiv>
      <Title>
        <Logo src="logo192.png" alt="logo" />
        BetBook
        
        <OffsetVersionDisplay />
      </Title>
    </TopBarDiv>
  );
}

export default TopBar;
