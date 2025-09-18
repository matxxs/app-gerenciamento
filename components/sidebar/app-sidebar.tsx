"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout, selectPermissions, selectUser } from "@/lib/features/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/app-selector";
import { type TelaPermissaoNode } from "@/lib/types";
import * as icons from "lucide-react";
import { Command, type LucideIcon } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";

export type NavMainItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
  items: NavMainItem[];
};

const getIconComponent = (iconName: string | undefined | null): LucideIcon => {
  if (!iconName) {
    return icons.SquareTerminal;
  }

  const IconComponent = (icons as unknown as Record<string, LucideIcon>)[iconName];

  return IconComponent || icons.SquareTerminal;



};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAppSelector(selectUser);
  const permissions = useAppSelector(selectPermissions);
  const pathname = usePathname();

  const dispatch = useAppDispatch();
  const router = useRouter();


  const transformPermissionsToNavItems = React.useCallback(
    (nodes: TelaPermissaoNode[]): NavMainItem[] => {
      return nodes
        .filter(node => node.pode_ler)
        .map(node => ({
          title: node.titulo,
          url: node.rota || "#",
          icon: getIconComponent(node.icone),
          isActive: pathname === node.rota,
          items: node.filhos?.length
            ? transformPermissionsToNavItems(node.filhos)
            : [],
        }));
    },
    [pathname]
  );

  const navItems = React.useMemo(() => {
    if (!permissions?.telas) return [];
    return transformPermissionsToNavItems(permissions.telas);
  }, [permissions, transformPermissionsToNavItems]);

  const userData = user
    ? {
      name: user.nome_completo,
      email: user.email,
      avatar: "/avatars/default.jpg",
    }
    : {
      name: "Visitante",
      email: "Faça login para continuar",
      avatar: "/avatars/guest.jpg",
    };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/profile" className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shadow-md">
                  <AvatarImage src="/professional-woman-avatar.png" alt={userData.name} />
                  <AvatarFallback
                    className="h-full w-full flex items-center justify-center text-lg font-semibold bg-primary text-primary-foreground rounded-full"
                  >
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col text-left">
                  <span className="truncate font-medium text-sm">{userData.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.nome_funcao}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="p-2"> 
        <div className="my-2 h-px w-full bg-border" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 "
          type="button"
          onClick={handleLogout}
        >
          <icons.LogOut className="size-4" />
          <span>Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}