/**
 * AppSidebar.tsx
 * ----------------
 * This component renders the **entire left sidebar UI** of the chat application,
 * similar to ChatGPT's sidebar.
 *
 * Responsibilities:
 * - Displays "New Chat" button
 * - Lists all recent chat sessions
 * - Allows switching between chat conversations
 * - Handles chat creation, deletion, and (future) renaming
 * - Manages collapsed / expanded sidebar states
 * - Shows user profile section at the bottom
 *
 * Architecture Role:
 * - Reads chat session metadata from `useChatListStore`
 * - Controls chat session lifecycle using `useChatStore`
 * - Acts as the main navigation hub of the application
 *
 * UX Goals:
 * - Fast chat switching
 * - Instant new chat creation
 * - Clean minimal UI (ChatGPT-like)
 * - Smooth collapsible sidebar behavior
 *
 * Future Enhancements:
 * - Inline chat rename
 * - Context menu (rename, delete, share)
 * - Chat pinning & folders
 */

"use client";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "@/store/useChatStore";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useUIStore } from "@/store/useUIStore";

import { useAuthStore } from "@/store/useAuthStore";

import {
  Search,
  Plus,
  MessageSquare,
  Settings,
  MoreHorizontal,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useChatListStore } from "@/store/useChatListStore";
import { useIsMobile } from "@/hooks/use-mobile";



function IconTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const chats = useChatListStore((s) => s.chats || []);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);


  const isMobile = useIsMobile();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const createNewChat = useChatStore((s) => s.createNewChat);
  const deleteChat = useChatListStore((s) => s.deleteChat);
  const clearChat = useChatStore((s) => s.clearChat);
  const renameChat = useChatListStore((s) => s.renameChat);
  const clearAllChat=useChatListStore((s)=>s.clearAll);
  const collapsibleMode = isMobile ? "offcanvas" : "icon";
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);


  return (
    <TooltipProvider delayDuration={150}>
      <Sidebar
        variant={isMobile ? "sidebar" : "floating"}
        collapsible={isMobile ? "offcanvas" : "icon"}
        className="fixed inset-y-0 left-0 z-40 w-[280px] md:static"
      >
        {/* =============== Header =============== */}
        <SidebarHeader className="p-3">
          <div className="flex items-center gap-2">
            

            <SidebarMenu className="flex-1">
              <SidebarMenuItem>
                <IconTooltip label="New Chat">
                  <SidebarMenuButton
                    size="lg"
                    className={`
                      w-full gap-2
                      ${isCollapsed ? "justify-center px-0" : "justify-start"}
                      bg-zinc-200 dark:bg-zinc-800
                    `}
                    onClick={() => {
                      const newId = createNewChat();
                      navigate(`/c/${newId}`);
                      if (isMobile) setOpen(false);
                    }}
                  >
                    <Plus className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <span className="font-semibold truncate">
                        New Chat
                      </span>
                    )}
                  </SidebarMenuButton>
                </IconTooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarHeader>

        {/* =============== Content =============== */}
                  {/* Search Button */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <IconTooltip label="Search chats">
                    <SidebarMenuButton
                      onClick={() => setSearchOpen(true)}
                      className={`
                        w-full gap-2
                        ${isCollapsed ? "justify-center px-0" : "justify-start"}
                      `}
                    >
                      <Search className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>Search</span>}
                    </SidebarMenuButton>
                  </IconTooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>


          {/* Recent chats */}
          {(!isCollapsed || isMobile) && (
            <SidebarGroup>
              <SidebarGroupLabel>Recent</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <div className="flex w-full items-center gap-1">
                        
                        <SidebarMenuButton asChild className="flex-1 justify-start gap-2">
                          <a href={`/c/${chat.id}`}onClick={() => isMobile && setOpen(false)}>
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate">{chat.title}</span>
                          </a>
                        </SidebarMenuButton>

                        <SidebarMenuAction asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent side="right" align="start">
                              <DropdownMenuItem
                                onClick={() => {
                                  const title = prompt("Rename chat", chat.title);
                                  if (title) renameChat(chat.id, title);
                                }}
                              >
                                Rename
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={() => {
                                  deleteChat(chat.id);
                                  clearChat(chat.id);
                                  navigate("/");
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuAction>

                      </div>
                    </SidebarMenuItem>

                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* =============== Footer =============== */}
        <SidebarFooter className="border-t p-3 dark:border-zinc-800">
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className={`w-full gap-2 ${
              isCollapsed ? "justify-center" : "justify-start"
            }`}
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-500 text-xs font-bold text-white">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.[0] || "U"
              )}
            </div>

            {!isCollapsed && user && (
              <div className="ml-2 flex flex-col text-sm">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-zinc-500">
                  {user.email}
                </span>
              </div>
            )}

            {!isCollapsed && (
              <Settings className="ml-auto h-4 w-4 text-zinc-400" />
            )}
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="end">
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={logout}
          >
            🚪 Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>



      </Sidebar>
    </TooltipProvider>
  );
}
