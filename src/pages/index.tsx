import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const user = useUser();
  return (
    <div>
      <h1 className="py-8 text-4xl text-center font-bold">
        Welcome
        {user ? (
          <span className="mx-2 text-blue-600">
            {user.displayname || user.name}
          </span>
        ) : null}
        👋
      </h1>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
};
