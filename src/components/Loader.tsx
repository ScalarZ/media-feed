import { Loader2 } from "lucide-react";
import React from "react";

export default function Loader() {
  return (
    <div className="px-2 py-4 w-full flex justify-center items-center animate-spin">
      <Loader2 />
    </div>
  );
}
