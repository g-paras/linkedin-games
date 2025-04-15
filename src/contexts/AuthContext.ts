import { UserAuth } from "@/types";
import { createContext } from "react";

export const AuthContext = createContext<UserAuth>({ isLoggedIn: false });