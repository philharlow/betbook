import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useToastState } from '../store/toastStore';

const ToastDiv = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #3339;
  max-width: 80%;
  padding: 50px;
  font-size: 30px;
  color: #fff;
  border-radius: 30px;
  opacity: 0;
  transition: opacity 0.5s linear;
  pointer-events: none;
`;

let timeout: NodeJS.Timeout;

function Toast() {
  const toast = useToastState(state => state.toast);
  const showToast = useToastState(state => state.showToast);
  const toastDuration = useToastState(state => state.toastDuration);
  const [currenToast, setCurrentToast] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast) setCurrentToast(toast);
  }, [toast]);

  useEffect(() => {
    if (!ref.current) return;
    clearTimeout(timeout);
    if (toast) {
      ref.current.style.opacity = "1";
      timeout = setTimeout(() => {
        showToast("");
      }, toastDuration);
    } else {
      ref.current.style.opacity = "0";
    }
  }, [toast, toastDuration, ref, showToast]);
  
  return (
    <ToastDiv ref={ref}>
      {currenToast}
    </ToastDiv>
  );
}

export default Toast;
