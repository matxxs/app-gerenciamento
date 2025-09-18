import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/config/database';
import { Tela } from "@/lib/types";

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