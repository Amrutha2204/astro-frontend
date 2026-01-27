import toast from "react-hot-toast";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showWarning = (message: string) => {
  toast(message, {
    icon: "⚠️",
    style: {
      borderLeftColor: "#f59e0b",
    },
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    icon: "ℹ️",
    style: {
      borderLeftColor: "#3b82f6",
    },
  });
};

