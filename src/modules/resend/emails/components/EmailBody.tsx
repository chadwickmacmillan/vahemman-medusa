import { Body } from "@react-email/components";
import { ReactNode } from "react";

const EmailBody = ({ children }: { children: ReactNode }) => {
  return (
    <Body className="bg-white my-10 mx-auto w-full max-w-2xl">{children}</Body>
  );
};

export default EmailBody;
