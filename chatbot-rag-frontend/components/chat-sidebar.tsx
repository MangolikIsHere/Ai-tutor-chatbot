'use client';

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  Plus,
  Trash2,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  FileUp,
  UserCircle2,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
  Crown,
  Search,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

import {
  ScrollArea,
} from '@/components/ui/scroll-area';

import {
  useChatContext,
} from '@/lib/chat-context';

import {
  useAuthUser,
} from '@/lib/auth-user';

import {
  useFirebaseAuth,
} from '@/lib/firebase-auth';

import {
  DocumentUploadDialog,
} from '@/components/document-upload-dialog';

import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────────── */

export function ChatSidebar() {
  const router = useRouter();

  const {
    chats,
    currentChat,
    createNewChat,
    switchChat,
    deleteCurrentChat,
  } = useChatContext();

  const { logout } =
    useFirebaseAuth();

  const {
    user,
    displayName,
  } = useAuthUser();

  const [collapsed, setCollapsed] =
    useState(false);

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const panelRef =
    useRef<HTMLDivElement>(
      null
    );

  const avatarInitial =
    useMemo(() => {
      const first =
        displayName
          ?.trim()
          ?.charAt(0);

      return first
        ? first.toUpperCase()
        : 'N';
    }, [displayName]);

  useEffect(() => {
    function clickOutside(
      e: MouseEvent
    ) {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          e.target as Node
        )
      ) {
        setProfileOpen(
          false
        );
      }
    }

    document.addEventListener(
      'mousedown',
      clickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        clickOutside
      );
  }, []);

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  function handleAccountClick() {
    setProfileOpen(false);
    router.push('/account');
  }

  const filteredChats =
    chats.filter((chat) =>
      chat.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const profileMenuItems = [
    {
      icon: UserCircle2,
      label: 'Account',
    },
    {
      icon: CreditCard,
      label: 'Subscription',
    },
    {
      icon: BarChart3,
      label: 'Usage',
    },
    {
      icon: Settings,
      label: 'Settings',
    },
  ] as const;

  return (
    <>
      <aside
        className={cn(
          'h-full border-r border-sidebar-border bg-sidebar flex flex-col transition-all duration-300 shrink-0',
          collapsed
            ? 'w-[72px]'
            : 'w-[300px]'
        )}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div
            className={cn(
              'flex items-center gap-3',
              collapsed &&
                'justify-center'
            )}
          >
            <div className="w-11 h-11 rounded-2xl btn-gradient flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="font-semibold text-[18px] tracking-tight">
                  NeuralChat
                </div>

                <div className="text-[10px] uppercase tracking-[0.24em] opacity-45 mt-0.5">
                  PREMIUM AI
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 space-y-2 pb-3">
          <Button
            onClick={
              createNewChat
            }
            className={cn(
              'h-11 rounded-2xl btn-gradient text-white shadow-md',
              collapsed
                ? 'w-11 p-0'
                : 'w-full justify-start gap-2 px-4'
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />

            {!collapsed &&
              'New Chat'}
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              setUploadOpen(
                true
              )
            }
            className={cn(
              'h-10 rounded-2xl',
              collapsed
                ? 'w-11 p-0'
                : 'w-full justify-start gap-2 px-4'
            )}
          >
            <FileUp className="w-4 h-4 shrink-0" />

            {!collapsed &&
              'Upload Docs'}
          </Button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="h-10 rounded-2xl border border-sidebar-border bg-background/60 flex items-center gap-2 px-3">
              <Search className="w-4 h-4 opacity-50" />

              <input
                value={
                  search
                }
                onChange={(
                  e
                ) =>
                  setSearch(
                    e.target
                      .value
                  )
                }
                placeholder="Search chats"
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>
        )}

        {/* Chats */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-3">
            {filteredChats.map(
              (
                chat,
                i
              ) => {
                const active =
                  currentChat?.id ===
                  chat.id;

                return (
                  <motion.div
                    key={
                      chat.id
                    }
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        i *
                        0.02,
                    }}
                    className="group relative"
                  >
                    <button
                      onClick={() =>
                        switchChat(
                          chat.id
                        )
                      }
                      className={cn(
                        'w-full h-11 rounded-2xl text-sm flex items-center gap-3 px-3 transition-all',
                        active
                          ? 'bg-sidebar-accent shadow-sm'
                          : 'hover:bg-sidebar-accent/70',
                        collapsed &&
                          'justify-center px-0'
                      )}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />

                      {!collapsed && (
                        <span className="truncate flex-1 text-left">
                          {
                            chat.title
                          }
                        </span>
                      )}
                    </button>

                    {!collapsed &&
                      active && (
                        <button
                          onClick={(
                            e
                          ) => {
                            e.stopPropagation();
                            deleteCurrentChat();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                  </motion.div>
                );
              }
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div
          ref={panelRef}
          className="p-3 border-t border-sidebar-border relative"
        >
          {/* Popup */}
          <AnimatePresence>
            {!collapsed &&
              profileOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                  }}
                  className="absolute bottom-[76px] left-3 right-3 rounded-3xl border border-sidebar-border bg-background/95 backdrop-blur-xl shadow-2xl p-2 z-50"
                >
                  <div className="px-3 py-2 mb-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />

                    <span className="text-xs font-medium">
                      Free Plan
                    </span>
                  </div>

                  {profileMenuItems.map(
                    (
                      item
                    ) => {
                      const Icon =
                        item.icon;

                      return (
                        <button
                          key={
                            item.label
                          }
                          onClick={
                            handleAccountClick
                          }
                          className="w-full h-11 rounded-2xl px-3 flex items-center gap-3 hover:bg-sidebar-accent text-sm"
                        >
                          <Icon className="w-4 h-4" />
                          {
                            item.label
                          }
                        </button>
                      );
                    }
                  )}

                  <div className="my-2 border-t border-sidebar-border" />

                  <button
                    onClick={
                      handleLogout
                    }
                    className="w-full h-11 rounded-2xl px-3 flex items-center gap-3 hover:bg-red-500/10 text-red-400 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
          </AnimatePresence>

          {/* Trigger */}
          <button
            onClick={() =>
              setProfileOpen(
                !profileOpen
              )
            }
            className={cn(
              'w-full rounded-2xl px-2 py-2 flex items-center gap-3 hover:bg-sidebar-accent transition',
              collapsed &&
                'justify-center px-0'
            )}
          >
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-muted shrink-0">
              {user?.photoURL ? (
                <img
                  src={
                    user.photoURL
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full btn-gradient flex items-center justify-center text-white text-sm font-semibold">
                  {
                    avatarInitial
                  }
                </div>
              )}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sm font-semibold truncate">
                    {
                      displayName
                    }
                  </div>

                  <div className="text-[11px] opacity-50 truncate">
                    {user?.email}
                  </div>
                </div>

                <ChevronUp
                  className={cn(
                    'w-4 h-4 opacity-45 transition-transform',
                    profileOpen &&
                      'rotate-180'
                  )}
                />
              </>
            )}
          </button>

          {/* Collapse */}
          <div className="mt-2 flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                setCollapsed(
                  !collapsed
                )
              }
              className="w-8 h-8 rounded-xl"
            >
              {collapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={
          setUploadOpen
        }
      />
    </>
  );
}