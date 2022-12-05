import create from 'zustand'

const defaultDuration = 1500;

interface ToastState {
	toast: string;
	toastDuration: number;
	showToast: (toast: string, toastDuration?: number) => void;
}

export const useToastState = create<ToastState>((set, get) => ({
	toast: "",
	toastDuration: defaultDuration,
	showToast: (toast: string, toastDuration?: number) => {
		set({toast, toastDuration: toastDuration || defaultDuration})
	},
}));
