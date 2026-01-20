import type { ReactNode } from "react";
import { Context } from "./Context";

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  return <Context.Provider value={{}}>{children}</Context.Provider>;
};
