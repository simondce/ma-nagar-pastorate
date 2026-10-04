import { createContext, useContext } from "react";
export const ParishContext = createContext(null);
export const useParish = () => useContext(ParishContext);
