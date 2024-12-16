import React from 'react';
import styled from 'styled-components/macro';
import pjson from "../../package.json";

const VersionDiv = styled.div`
  /* position: absolute;
  right: 35px;
  bottom: 0;
  z-index: 100000; */
  color: #666;
  font-size: 10px;
  pointer-events: none;
`;

interface Props {
  className?: string;
}

function VersionDisplay({className}: Props) {
  return (
    <VersionDiv className={className}>
      v{pjson.version}
    </VersionDiv>
  );
}

export default VersionDisplay;
