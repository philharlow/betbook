import React from 'react';
import styled from 'styled-components/macro';

const SmallToggleDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  font-size: 8px;
  cursor: pointer;
`;

const ToggleDiv = styled.label`
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  pointer-events: none;
  
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
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
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
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
  }
`;

// TODO: make size dynamic
interface Props {
  checked: boolean;
  label?: string;
  onChecked: (checked: boolean) => void;
  className?: string;
}

function SmallToggle({ checked, onChecked, className, label }: Props) {
  return (
    <SmallToggleDiv onClick={() => onChecked(!checked)}>
      <ToggleDiv className={className}>
        <input type="checkbox" checked={checked} onChange={() => {}} />
        <RoundSlider className="slider" />
      </ToggleDiv>
      {label || ""}
    </SmallToggleDiv>
  );
}

export default SmallToggle;
