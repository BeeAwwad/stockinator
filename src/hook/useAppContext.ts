import { useContext } from "react";
import { Context } from "@/context/Context";

export const useAppContext = () => useContext(Context);
