import React, { useEffect, RefObject } from "react";

function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  btnRef?: RefObject<HTMLElement>
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      if (btnRef && (!btnRef.current || btnRef.current.contains(target))) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, btnRef]);
}
export default useOnClickOutside;
