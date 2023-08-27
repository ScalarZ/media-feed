import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Posts from "@/components/Posts";
import type { User } from "@/types";

export default function Profile({ user }: { user: User }) {
  return (
    <main className="relative pb-8 flex flex-col items-center justify-start">
      {!!user && <Posts user={user} />}
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: {
      user: session?.user,
      session,
    },
  };
};
