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
import { LogOut } from "lucide-react";

export default function Header() {
  const user = useUser();
  return (
    <header className="py-3 w-full flex justify-between items-center">
      {user ? (
        <>
          <CreatePostWindow />
          <div className="flex items-center gap-x-2">
            <span className="font-medium">{user.name}</span>
            <Menu>
              <NextImage
                src={user.image || ProfilePicture}
                height={32}
                width={32}
                alt={user.name!}
                className="h-10 w-10 rounded-full object-cover"
              />
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

function Menu({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="text-rose-600 flex items-center gap-x-1 cursor-pointer"
          onClick={async () => {
            await signOut();
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
