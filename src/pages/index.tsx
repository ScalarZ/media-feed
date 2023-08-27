import { GetServerSideProps } from "next";
import { Session, getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "./api/auth/[...nextauth]";
// import { useUser } from "@/hooks/useUser";

export default function Home({ session }: { session: Session }) {
  console.log({ session });
  return (
    <div>
      <h1 className="py-8 text-4xl text-center font-bold">
        Welcome
        {/* <span className="text-blue-600">{user ? user.name : null}</span>{" "} */}
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
