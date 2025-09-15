import { useMemo } from 'react';
import { type TelaPermissaoNode } from '@/lib/types';
import { useAppSelector } from './app-selector';
import { selectPermissions } from '../features/auth/auth-slice';

interface ScreenPermissions {
  pode_ler: boolean;
  pode_criar: boolean;
  pode_atualizar: boolean;
  pode_deletar: boolean;
}

type ScreenName = string;

/**
 * Função recursiva para encontrar uma tela dentro de uma árvore de permissões.
 * @param telas - O array de nós de tela para pesquisar.
 * @param screenName - A chave_tela que estamos procurando.
 * @returns O nó da tela encontrado ou undefined.
 */
const findScreenInTree = (telas: TelaPermissaoNode[], screenName: ScreenName): TelaPermissaoNode | undefined => {
    for (const tela of telas) {
        if (tela.chave_tela === screenName) {
            return tela;
        }
        if (tela.filhos && tela.filhos.length > 0) {
            const foundInChildren = findScreenInTree(tela.filhos, screenName);
            if (foundInChildren) {
                return foundInChildren;
            }
        }
    }
    return undefined;
};


/**
 * Hook customizado para obter as permissões de uma tela específica, 
 * funcionando para menus e submenus.
 * @param screenName - A 'chave_tela' da tela que você quer verificar.
 * @returns Um objeto contendo as permissões para a tela.
 */
export const usePermissions = (screenName: ScreenName): ScreenPermissions => {
  const allPermissions = useAppSelector(selectPermissions);

  const screenPermissions = useMemo(() => {
    if (!allPermissions?.telas) {
        return { pode_ler: false, pode_criar: false, pode_atualizar: false, pode_deletar: false };
    }


    const foundScreen = findScreenInTree(allPermissions.telas, screenName);

    if (!foundScreen) {
      return {
        pode_ler: false,
        pode_criar: false,
        pode_atualizar: false,
        pode_deletar: false,
      };
    }

    return {
      pode_ler: foundScreen.pode_ler,
      pode_criar: foundScreen.pode_criar,
      pode_atualizar: foundScreen.pode_atualizar,
      pode_deletar: foundScreen.pode_deletar,
    };
  }, [allPermissions, screenName]);

  return screenPermissions;
};