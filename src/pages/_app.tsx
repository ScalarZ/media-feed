import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { trpc } from "@/utils/trpc";
import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

export default trpc.withTRPC(App);
