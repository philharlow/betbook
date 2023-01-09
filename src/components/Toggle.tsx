import React from 'react';
import styled from 'styled-components/macro';

const ToggleDiv = styled.label`
  position: relative;
  display: inline-block;
  width: 56px;
  height: 30px;
  cursor: pointer;
  
  /* Hide default HTML checkbox */
  & input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  & input:checked + .slider {
    background-color: var(--blue);
  }

  & input:focus + .slider {
    box-shadow: 0 0 1px var(--blue);
  }

  & input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }
`;

const RoundSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
  }
`;

interface Props {
  checked: boolean;
  onChecked: (checked: boolean) => void;
}

function Toggle({ checked, onChecked }: Props) {
  return (
    <ToggleDiv>
      <input type="checkbox" checked={checked} onChange={() => onChecked(!checked)} />
      <RoundSlider className="slider" />
    </ToggleDiv>
  );
}

export default Toggle;
