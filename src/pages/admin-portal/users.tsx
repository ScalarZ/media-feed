import NavBar from "@/components/Admin/NavBar";
import { useUser } from "@/hooks/useUser";
import { trpc } from "@/utils/trpc";
import UsersTable from "@/components/Admin/UsersTable";
import { columns } from "@/components/Admin/Columns/UsersTableColumns";
import Loader from "@/components/Loader";
import { useState } from "react";
import UserInfoWindow from "@/components/Admin/UserInfoWindow";
import { useToggle } from "@/hooks/useToggle";

export interface DataUser {
  isEmailVerified: boolean | null;
  id: string;
  name: string;
  displayname: string | null;
  image: string | null;
  email: string;
  phone: string | null;
}

export default function Users() {
  const user = useUser();
  const { data, isLoading,refetch } = trpc.userRouter.getUsers.useQuery({
    isAdmin: user?.isAdmin ?? false,
  });
  const [userInfo, setUserInfo] = useState<DataUser | null>(null);
  const [toggleValue, toggle] = useToggle();

  return (
    <div className="p-4">
      <NavBar />
      {!data || isLoading ? (
        <Loader />
      ) : (
        <UsersTable
          columns={columns}
          data={data}
          toggle={toggle}
          setUserInfo={setUserInfo}
        />
      )}
      <UserInfoWindow
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        toggleValue={toggleValue}
        toggle={toggle}
        refetch={refetch}
      />
    </div>
  );
}
