// // app/api/telas/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { getPool, sql } from '@/config/database';

// interface Tela {
//     id_tela: number;
//     nome_tela: string;
//     descricao: string;
//     rota: string;
//     icone: string;
//     ordem: number;
//     ativo: boolean;
// }

// export async function GET(request: NextRequest) {
//     try {
//         const pool = await getPool();
//         const result = await pool.request()
//             .query<Tela>(`
//                 SELECT 
//                     id_tela, nome_tela, descricao, rota, icone, ordem, ativo
//                 FROM Telas
//                 WHERE ativo = 1
//                 ORDER BY ordem;
//             `);
//         const telas = result.recordset;
//         return NextResponse.json({ data: telas });
//     }
//     catch (error) {
//         console.error('Erro ao buscar telas:', error);
//         return NextResponse.json({ message: 'Erro ao buscar telas.' }, { status: 500 });
//     }
// }  

import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database';

// Interface atualizada para refletir a nova estrutura da tabela
interface Tela {
    id_tela: number;
    id_tela_pai: number | null; // Adicionado
    titulo: string;             // Renomeado de nome_tela
    chave_tela: string;         // Adicionado
    descricao: string | null;
    rota: string | null;
    icone: string | null;
    ordem: number;
    ativo: boolean;
}

export async function GET(request: NextRequest) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query<Tela>(`
                SELECT 
                    id_tela, id_tela_pai, titulo, chave_tela, descricao, rota, icone, ordem, ativo
                FROM Telas
                WHERE ativo = 1
                ORDER BY ordem;
            `);
        const telas = result.recordset;
        return NextResponse.json({ data: telas });
    }
    catch (error) {
        console.error('Erro ao buscar telas:', error);
        return NextResponse.json({ message: 'Erro ao buscar telas.' }, { status: 500 });
    }
}