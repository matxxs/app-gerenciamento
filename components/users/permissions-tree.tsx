"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Tela, TelaPermissao, TelaPermissaoNode, UsuarioTelaAcesso } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

export const buildPermissionsTree = (telas: Tela[]): TelaPermissaoNode[] => {
    const map = new Map<number, TelaPermissaoNode>();
    const roots: TelaPermissaoNode[] = [];
    telas.forEach(tela => map.set(tela.id_tela, { ...tela, filhos: [] }));
    map.forEach(node => {
        if (node.id_tela_pai && map.has(node.id_tela_pai)) {
            map.get(node.id_tela_pai)!.filhos.push(node);
        } else {
            roots.push(node);
        }
    });
    return roots;
};

interface PermissionsTreeProps {
    permissionTree: TelaPermissaoNode[];
}

export const PermissionsTree = ({ permissionTree }: PermissionsTreeProps) => {
    const { control, getValues } = useFormContext();
    
    const findFieldIndex = (telaId: number): number => {
        const telasAcesso = getValues('telasAcesso') as UsuarioTelaAcesso[] || [];
        return telasAcesso.findIndex((tela) => tela.id_tela === telaId);
    };

    const renderNode = (node: TelaPermissaoNode) => {
        const fieldIndex = findFieldIndex(node.id_tela);
        if (fieldIndex === -1) return null;

        const hasChildren = node.filhos && node.filhos.length > 0;
        const permissions: (keyof Omit<UsuarioTelaAcesso, 'id_tela'>)[] = ['pode_criar', 'pode_ler', 'pode_atualizar', 'pode_deletar'];

        return (
             <Collapsible key={node.id_tela} defaultOpen className="pl-2">
                <div className="flex items-center justify-between py-2 border-b">
                    <span className="font-semibold text-md">{node.titulo}</span>
                     {hasChildren && <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="w-9 p-0 data-[state=open]:rotate-90 transition-transform"><ChevronRight className="h-4 w-4" /></Button></CollapsibleTrigger>}
                </div>

                {!hasChildren ? (
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 py-3 px-4">
                        {permissions.map(perm => (
                            <Controller key={perm} name={`telasAcesso.${fieldIndex}.${perm}`} control={control}
                                render={({ field }) => (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id={`${perm}-${node.id_tela}`} checked={!!field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor={`${perm}-${node.id_tela}`} className="capitalize font-normal">{perm.replace('pode_', '')}</Label>
                                    </div>
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-3 px-4 text-sm text-muted-foreground">
                        <span>As permissões são gerenciadas nos itens filhos.</span>
                    </div>
                )}
                
                 {hasChildren && <CollapsibleContent className="pl-6 border-l-2 ml-2">{node.filhos.map(childNode => renderNode(childNode))}</CollapsibleContent>}
             </Collapsible>
        );
    };

    return <div className="space-y-4">{permissionTree.map(node => renderNode(node))}</div>;
};