import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  updateSessionActivity,
  isSessionExpiredDueToInactivity,
  clearSession,
} from "@/utils/sessionManager";
import "../styles/globals.css";
import Layout from '../components/Layout';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    const handleActivity = () => {
      updateSessionActivity();
    };

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    const interval = setInterval(() => {
      if (isSessionExpiredDueToInactivity()) {
        clearSession();
        router.push("/login");
      }
    }, 60 * 1000); // check every minute

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearInterval(interval);
    };
  }, [router]);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </QueryClientProvider>
    </Provider>
  );
}

export default MyApp;