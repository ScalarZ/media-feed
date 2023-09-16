import { useUser } from "@/hooks/useUser";
import NextImage from "./common/Image";
import ProfilePicture from "@/assets/profile-picutre.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import CreatePostWindow from "./CreatePostWindow";
import { Button } from "./ui/button";
import Link from "next/link";
import { LogOut, Settings, User, UserCircle, Shield } from "lucide-react";
import useImageUrl from "@/hooks/useImageUrl";
import { AuthUser } from "next-auth";

export default function Header() {
  const user = useUser();
  const imageUrl = useImageUrl(user?.image ?? "", [user]);
  return (
    <header className="sticky top-0 px-4 py-3 w-full flex justify-between items-center bg-white shadow z-20">
      {user ? (
        <>
          <CreatePostWindow />
          <div className="flex items-center gap-x-2">
            <span className="font-medium">{user.displayname || user.name}</span>
            <Menu user={user}>
              {user?.image ? (
                <NextImage
                  src={imageUrl}
                  height={32}
                  width={32}
                  alt={user?.name!}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <UserCircle strokeWidth={1.5} size={36} />
              )}
            </Menu>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold">Logo</h2>
          <div className="text-center space-x-2">
            <Link href="login">
              <Button>Sign in</Button>
            </Link>
            <Link href="register">
              <Button variant="secondary">Sign up</Button>
            </Link>
          </div>
        </>
      )}
    </header>
  );
}

function Menu({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="-translate-x-1/3">
        <Link href="/profile">
          <DropdownMenuItem className="flex items-center gap-x-1 cursor-pointer">
            <User size={14} />
            <span className="mb-0.5">My profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="flex items-center gap-x-1 cursor-pointer">
            <Settings size={14} />
            <span className="mb-0.5">Settings</span>
          </DropdownMenuItem>
        </Link>
        {user.isAdmin && (
          <Link href="/admin-portal/posts">
            <DropdownMenuItem className="flex items-center gap-x-1 cursor-pointer">
              <Shield size={14} />
              <span className="mb-0.5">Admin portal</span>
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuItem
          className="text-rose-600 flex items-center gap-x-1 cursor-pointer"
          onClick={async () => {
            await signOut({ redirect: false });
            router.push("/login");
          }}
        >
          <LogOut size={14} />
          <span className="mb-0.5">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
