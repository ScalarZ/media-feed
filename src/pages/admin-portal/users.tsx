import NavBar from "@/components/Admin/NavBar";
import { useUser } from "@/hooks/useUser";
import { trpc } from "@/utils/trpc";
import UsersTable from "@/components/Admin/UsersTable";
import UsersFilter from "@/components/Admin/UsersFilter";
import { columns } from "@/components/Admin/Columns/UsersTableColumns";
import Loader from "@/components/Loader";
import { useState } from "react";
import UserInfoWindow from "@/components/Admin/UserInfoWindow";
import { useToggle } from "@/hooks/useToggle";
import { Separator } from "@/components/ui/separator";

export interface DataUser {
  index?: number;
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
  const [userInfo, setUserInfo] = useState<DataUser | null>(null);
  const [toggleValue, toggle] = useToggle();
  const [data, setData] = useState<DataUser[]>([]);

  return (
    <div className="p-4">
      <NavBar />
      <UsersFilter user={user} setData={setData} />
      <Separator />
      {data.length ? (
        <UsersTable
          columns={columns}
          data={data}
          toggle={toggle}
          setUserInfo={setUserInfo}
        />
      ) : null}
      <UserInfoWindow
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        setData={setData}
        toggleValue={toggleValue}
        toggle={toggle}
      />
    </div>
  );
}
