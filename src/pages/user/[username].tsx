import { GetServerSideProps } from "next";
import Posts from "@/components/Posts";
import { User } from "@/types";
import { getUserByUsername } from "@/utils/getUser";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
// import { GalleryVertical, Grid } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

function User({ user }: { user: User }) {
  const [view, setView] = useState<"scroll" | "grid">("scroll");
  const { push } = useRouter();
  const viewUrlQuery = useMemo(
    () => `/user/${user.username}?view=${view}`,
    [user, view]
  );
  function handleView(view: "scroll" | "grid") {
    setView(view);
    push(viewUrlQuery);
  }
  return (
    <div className="py-2">
      <h1 className="py-2 text-xl text-center font-semibold">
        Welcome to <span className="text-blue-600">{user.username}&apos;s</span>{" "}
        feeds 👋
      </h1>
      <div className="flex justify-center gap-x-6">
        {/* <GalleryVertical
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
        /> */}
      </div>
      <Posts user={user} view={view} />
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
