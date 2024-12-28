import create from "zustand";
import pjson from "../../package.json";

export enum LogLevel {
  Log = "log",
  Warn = "warn",
  Error = "error",
}

interface ConsoleLog {
  message: string;
  level: LogLevel;
  timestamp: Date;
}

interface ConsoleLogState {
  logMessages: ConsoleLog[];
  addLogMessage: (message: any, level: LogLevel) => void;
  clearLogMessage: () => void;
  // messageCountByLevel: { [key in LogLevel]: number };
}

export const useConsoleLogState = create<ConsoleLogState>((set, get) => ({
  logMessages: [],
  addLogMessage: (message: any, level: LogLevel) => {
    let messageString = message;
    if (Array.isArray(message)) {
      messageString = message.join(" ");
    }
    let newLog = {
      message: messageString,
      level,
      timestamp: new Date(),
    };
    set({
      logMessages: [...get().logMessages, newLog],
    });
    // set((state) => {
    //   let newState = { ...state };
    //   newState.logMessages.push(newLog);
    //   newState.messageCountByLevel[level]++;
    //   return newState;
    // });
  },
  clearLogMessage: () => {
    set({ logMessages: [] });
  },
  // messageCountByLevel: { log: 0, warn: 0, error: 0 },
}));

// export const useConsoleLog = () => useConsoleLogState((state) => state.consoleLog);
// export const useAddConsoleLog = () => useConsoleLogState((state) => state.addConsoleLog);
// export const useClearConsoleLog = () => useConsoleLogState((state) => state.clearConsoleLog);
// Interesting idea from copilot

// Bind to the console and errors
export const bindConsole = () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;


  console.log = function (...args: any) {
    originalLog.apply(console, args);
    useConsoleLogState.getState().addLogMessage(args, LogLevel.Log);
  };

  console.warn = function (...args: any) {
    originalWarn.apply(console, args);
    useConsoleLogState.getState().addLogMessage(args, LogLevel.Warn);
  };

  console.error = function (...args: any) {
    originalError.apply(console, args);
    useConsoleLogState.getState().addLogMessage(args, LogLevel.Error);
  };

  window.onerror = function (message, source, lineno, colno, error) {
    useConsoleLogState.getState().addLogMessage(message, LogLevel.Error);
  }

  window.addEventListener("unhandledrejection", function (event) {
    useConsoleLogState.getState().addLogMessage(event.reason, LogLevel.Error);
  });

  console.log("Console logging bound to store", "v"+pjson.version);
}