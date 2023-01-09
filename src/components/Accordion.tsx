import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';

const AccordionDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  background: #0a0a0a;
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  cursor: pointer;
`;

const TitleLabel = styled.div`
  font-size: 12px;
  color: #666;
  align-self: start;
`;

const Arrow = styled.div`
  font-size: 14px;
  color: #777;
  transform: rotate(-90deg);
  transition: transform 0.3s linear;
  &.open {
    transform: rotate(90deg);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: height 0.3s ease;
  overflow: hidden;
  &.closed {
    height: 0 !important;
  }
`;

interface Props {
  label: string,
  className?: string;
  startOpen?: boolean,
  children?: JSX.Element | JSX.Element[];
  dontDrawEmpty?: boolean;
}

function Accordion({ label, className, startOpen, children, dontDrawEmpty: dontDrawIfNoChildren } : Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(startOpen ?? true);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "unset"; // Allow height to update automatically
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [children]);

  if (dontDrawIfNoChildren) {
    if (Array.isArray(children) && !children?.length) return null;
    if (!children) return null;
  }

  return (
    <AccordionDiv className={className}>
      <Title onClick={() => setIsOpen(!isOpen)}>
        <TitleLabel>{label}</TitleLabel>
        <Arrow className={isOpen ? "open" : ""}>&gt;</Arrow>
      </Title>
      <Content ref={ref} className={isOpen ? "" : "closed"}>{children}</Content>
    </AccordionDiv>
  );
}

export default Accordion;
