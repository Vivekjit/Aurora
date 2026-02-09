import { create } from 'zustand';

interface UIState {
    isProfileOpen: boolean;
    isMessagingOpen: boolean;
    openProfile: () => void;
    closeProfile: () => void;
    openMessaging: () => void;
    closeMessaging: () => void;
    toggleProfile: () => void;
    toggleMessaging: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isProfileOpen: false,
    isMessagingOpen: false,
    openProfile: () => set({ isProfileOpen: true, isMessagingOpen: false }), // Close others
    closeProfile: () => set({ isProfileOpen: false }),
    openMessaging: () => set({ isMessagingOpen: true, isProfileOpen: false }), // Close others
    closeMessaging: () => set({ isMessagingOpen: false }),
    toggleProfile: () => set((state) => ({ isProfileOpen: !state.isProfileOpen, isMessagingOpen: false })),
    toggleMessaging: () => set((state) => ({ isMessagingOpen: !state.isMessagingOpen, isProfileOpen: false })),
}));
