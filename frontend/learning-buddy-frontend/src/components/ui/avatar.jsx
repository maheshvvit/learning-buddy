import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <img
      ref={ref}
      className={cn(
        "inline-block h-10 w-10 rounded-full object-cover",
        className
      )}
      alt="User avatar"
      {...props}
    />
  );
});

Avatar.displayName = "Avatar";

export { Avatar };
