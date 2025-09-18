// /lib/hooks/use-auth.ts (Exemplo)

import { selectUser } from "../features/auth/auth-slice";
import { useAppSelector } from "./app-selector";



// Este hook busca os dados do usuário logado do seu estado global (Redux neste caso)
export const useAuth = () => {
    const user = useAppSelector(selectUser);
    return { user };
};