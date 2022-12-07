import React from 'react';
import styled from 'styled-components/macro';
import pjson from "../../package.json";

const VersionDiv = styled.div`
  position: absolute;
  right: 1px;
  bottom: 0;
  z-index: 100;
  color: #666;
  font-size: 10px;
  pointer-events: none;
`;

function VersionDisplay() {
  return (
    <VersionDiv>
      v{pjson.version}
    </VersionDiv>
  );
}

export default VersionDisplay;
