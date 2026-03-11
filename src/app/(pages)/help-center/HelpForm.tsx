import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import React from "react";

const HelpForm = () => {
  const session = useSession();
  const userEmail = session.data?.user?.email || "";
  return (
    <div>
      <form action="" className="">
        <div className="flex justify-evenly gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <p className="text-sm">{userEmail}</p>
          </div>
          <div>
            <Label htmlFor="full-name">Full Name</Label>
            <p className="text-sm">{session.data?.user?.name || "Guest"}</p>
          </div>
        </div>
        <div className="flex mt-5 w-full">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Enter your subject" />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message"
              className="w-full mt-2"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default HelpForm;
