import { GetServerSideProps } from "next";
import Posts from "@/components/Posts";
import { User } from "@/types";
import { getUserByUsername } from "@/utils/getUser";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { GalleryVertical, Grid } from "lucide-react";
import { useState } from "react";

function User({ user }: { user: User }) {
  const [view, setView] = useState<"scroll" | "grid">("scroll");

  function handleView(view: "scroll" | "grid") {
    setView(view);
  }
  return (
    <div className="relative pt-2 pb-20">
      <h1 className="py-2 text-xl text-center font-semibold">
        Welcome to <span className="text-blue-600">{user.username}&apos;s</span>{" "}
        feeds 👋
      </h1>
      <Posts user={user} view={view} handleView={handleView} />
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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const username = context.query.username as string;

  try {
    const user = await getUserByUsername(username);
    return {
      props: {
        user,
        session,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

export default User;
