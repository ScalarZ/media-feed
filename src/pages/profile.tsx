import { GetServerSideProps } from "next";
import { AuthUser, getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Posts from "@/components/Posts";
import { GalleryVertical, Grid } from "lucide-react";
import { useState } from "react";

export default function Profile({ user }: { user: AuthUser }) {
  const [view, setView] = useState<"scroll" | "grid">("scroll");
  console.log(user)
  function handleView(view: "scroll" | "grid") {
    setView(view);
  }
  return (
    <main className="relative pb-8">
      {!!user && <Posts user={user} view={view} handleView={handleView} />}
      <div className="fixed bottom-0 py-2 w-full max-w-md border flex justify-center gap-x-6 bg-white z-10">
        <GalleryVertical
          className={`p-2 rounded ${
            view === "scroll" && "bg-slate-200"
          } cursor-pointer box-content hover:bg-slate-200`}
          onClick={() => handleView("scroll")}
        />
        <Grid
          className={`p-2 rounded ${
            view === "grid" && "bg-slate-200"
          } cursor-pointer box-content hover:bg-slate-200`}
          onClick={() => handleView("grid")}
        />
      </div>
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
