import React from "react";
import { Link } from "react-router-dom";

const LinkWrapper = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <Link ref={ref} {...props}>
      {children}
    </Link>
  );
});

LinkWrapper.displayName = "LinkWrapper";

export default LinkWrapper;
