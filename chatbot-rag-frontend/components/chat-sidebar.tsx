'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { useChatContext } from '@/lib/chat-context';

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { chats, currentChat, createNewChat, switchChat, deleteCurrentChat } =
    useChatContext();

  return (
    <div
      className={`bg-gray-100 dark:bg-gray-950 border-r border-gray-300 dark:border-gray-700 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && <h2 className="font-bold text-gray-900 dark:text-white">Chats</h2>}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 ml-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-90' : ''}`}
          />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={createNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && 'New Chat'}
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          !isCollapsed && (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-sm text-center">
              No chats yet
            </div>
          )
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <div key={chat.id} className="group">
                <button
                  onClick={() => switchChat(chat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors truncate ${
                    currentChat?.id === chat.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  title={chat.title}
                >
                  {isCollapsed ? (
                    <div className="w-6 h-6 rounded-md bg-gray-300 dark:bg-gray-600" />
                  ) : (
                    chat.title
                  )}
                </button>
                {!isCollapsed && currentChat?.id === chat.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={deleteCurrentChat}
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity h-7 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-300 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Connected
          </div>
        </div>
      )}
    </div>
  );
}
