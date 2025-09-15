"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { selectPermissions, selectUser } from "@/lib/features/auth/auth-slice";
import { useAppSelector } from "@/lib/hooks/app-selector";
import { type TelaPermissaoNode } from "@/lib/types";
import {
  BookOpen,
  Command,
  Home,
  LucideIcon,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type NavMainItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
  items: NavMainItem[];
};

const iconMap: { [key: string]: LucideIcon } = {
  "icon-home": Home,
  "icon-users": Users,
  "icon-settings": Settings2,
  "icon-docs": BookOpen,
  "default": SquareTerminal,
};

const getIconComponent = (iconName: string | undefined | null): LucideIcon => {
  return (iconName && iconMap[iconName]) || iconMap["default"];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAppSelector(selectUser);
  const permissions = useAppSelector(selectPermissions);
  const pathname = usePathname();


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
        name: user.nome_completo.split(' ')[0],
        email: user.email,
        avatar: "/avatars/default.jpg",
      }
    : {
        name: "Visitante",
        email: "Faça login para continuar",
        avatar: "/avatars/guest.jpg", 
      };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Seu App</span>
                  <span className="truncate text-xs">Painel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}