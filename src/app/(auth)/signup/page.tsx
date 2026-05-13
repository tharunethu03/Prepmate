import { Button } from "@/components/ui/button";
import Image from "next/image";
import RegisterForm from "./RegisterForm";
import OauthButtons from "@/components/ui/oauth-buttons";

const page = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-20">
        <div className="flex-col justify-center">
          <div className="flex-col items-start">
            <h1 className="text-4xl font-bold">Create Your Account</h1>
            <p className="text-sm text-secondary">
              Please create your account to continue
            </p>
          </div>
          <RegisterForm />
          <div className="flex items-center gap-3 my-11">
            <hr className="flex-1 border-muted" />
            <p className="text-sm text-tertiary">or</p>
            <hr className="flex-1 border-muted" />
          </div>

          <OauthButtons />
        </div>
        <Image
          src="/signup/signup-img.png"
          alt="Signup illustration"
          width={600}
          height={500}
          className="object-contain hidden md:block"
          priority
          sizes="600px"
        />
      </div>
    </div>
  );
};

export default page;
