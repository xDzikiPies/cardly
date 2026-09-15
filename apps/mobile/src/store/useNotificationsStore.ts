import { create } from "zustand";
import { AppNotification } from "@/types";
import { getNotifications, getUnreadNotificationsCount, markAllNotificationsRead, markNotificationRead } from "@/services/api";

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;

  fetchAll: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const notifications = await getNotifications();
      set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  refreshUnreadCount: async () => {
    try {
      const unreadCount = await getUnreadNotificationsCount();
      set({ unreadCount });
    } catch {
      // cicho — to tylko badge, nie warto pokazywać błędu za to
    }
  },

  markAllRead: async () => {
    await markAllNotificationsRead();
    set({ notifications: get().notifications.map((n) => ({ ...n, isRead: true })), unreadCount: 0 });
  },

  markRead: async (id) => {
    await markNotificationRead(id);
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },
}));
