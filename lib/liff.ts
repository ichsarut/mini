import liff from "@line/liff";

export type Liff = typeof liff;

export interface LiffError {
  code: string;
  message: string;
}

export const initLiff = async (liffId: string): Promise<Liff | null> => {
  try {
    await liff.init({ liffId });
    return liff;
  } catch (error) {
    console.error("LIFF initialization failed:", error);
    return null;
  }
};

export const isInClient = (): boolean => {
  if (typeof window === "undefined") return false;
  return liff.isInClient();
};

export const isLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  return liff.isLoggedIn();
};

export const login = (): void => {
  if (typeof window !== "undefined") {
    liff.login();
  }
};

export const logout = (): void => {
  if (typeof window !== "undefined") {
    liff.logout();
  }
};

export const getProfile = async () => {
  try {
    return await liff.getProfile();
  } catch (error) {
    console.error("Failed to get profile:", error);
    return null;
  }
};

export const sendMessages = async (messages: any[]) => {
  try {
    await liff.sendMessages(messages);
  } catch (error) {
    console.error("Failed to send messages:", error);
  }
};

export const openWindow = (url: string, external?: boolean) => {
  if (typeof window !== "undefined") {
    liff.openWindow({ url, external });
  }
};

export const closeWindow = () => {
  if (typeof window !== "undefined") {
    liff.closeWindow();
  }
};
