"use client";

import { useState } from "react";
import Image from "next/image";
import { avatars } from "@/data/avatars";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleQuestionMark, FileUser, Github, Linkedin } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const ProfileForm = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [name, setName] = useState("");
  const [field, setField] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [accountType, setAccountType] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isBaseInvalid = !name || !field || !roleTitle || !accountType;
  const isCreatorInvalid =
    accountType === "creator" &&
    (!name ||
      !field ||
      !roleTitle ||
      !accountType ||
      !linkedinLink ||
      !githubLink);

  const isDisabled = isBaseInvalid || isCreatorInvalid;

  const router = useRouter();

  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/profile-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          field,
          roleTitle,
          selectedAvatar,
          portfolioLink,
          linkedinLink,
          githubLink,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Profile setup failed");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Profile setup error:", error);
    }
  };
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-evenly lg:justify-center items-center md:gap-10">
        {/* LEFT SIDE – Avatars */}
        <div className="flex flex-col ">
          <div className="flex flex-row items-center gap-6 mt-10">
            <Image
              src={selectedAvatar}
              width={120}
              height={120}
              alt="Selected Avatar"
              className="rounded-full border-4 border-foreground ring-3 ring-accent shadow-md"
            />
            <p className="text-base font-medium">
              Choose your Avatar <span className="align-top text-error">*</span>
            </p>
          </div>

          <div className="flex flex-row items-center">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 bg-foreground border border-muted rounded-[12px] p-4 mt-6 max-h-96 overflow-y-auto">
              {avatars.map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  width={75}
                  height={75}
                  alt={`Avatar ${index + 1}`}
                  className={`rounded-full border-4 cursor-pointer transition 
                    ${
                      selectedAvatar === img
                        ? "border-background ring-2 ring-accent"
                        : "border-transparent"
                    }
                    hover:scale-105`}
                  onClick={() => setSelectedAvatar(img)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE – Inputs */}
        <div className="flex flex-col items-center ">
          <div className="flex flex-col items-start gap-5 mt-10 w-full max-w-md">
            {/* Full Name */}
            <div>
              <Label htmlFor="FullName">
                Full Name<span className="align-top text-error">*</span>
              </Label>

              <Input
                className="mt-2"
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Industry / Field */}
            <div>
              <Label htmlFor="Field">
                Industry / Field<span className="align-top text-error">*</span>
              </Label>

              <Dropdown
                className="mt-2"
                options={["Information Technology"]}
                placeholder="Select your field"
                onChange={(value) => setField(value)}
              />
            </div>

            {/* Job Title / Role */}
            <div>
              <Label htmlFor="Role">
                Job Title / Role<span className="align-top text-error">*</span>
              </Label>

              <Dropdown
                className="mt-2"
                options={[
                  "Frontend Engineer",
                  "Backend Engineer",
                  "Fullstack Engineer",
                  "Mobile Developer",
                  "DevOps Engineer",
                  "QA Engineer",
                ]}
                placeholder="Select your role"
                onChange={(value) => setRoleTitle(value)}
              />
            </div>

            {/* Account Type */}
            <div className="w-full">
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="AccountType">
                  Account Type<span className="align-top text-error">*</span>
                </Label>
                <HoverCard>
                  <HoverCardTrigger>
                    <CircleQuestionMark className="size-5 text-tertiary hover:text-accent" />
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-foreground border border-muted text-secondary w-md mr-10 rounded-[12px] text-sm ">
                    Choose <strong>Student</strong> to practice interviews, or{" "}
                    <strong>Creator</strong> to create and manage interviews for
                    others.
                  </HoverCardContent>
                </HoverCard>
              </div>

              <RadioGroup
                className="gap-5 mt-2"
                onValueChange={(value) => setAccountType(value)}
              >
                <div className="flex items-center space-x-2 border border-muted rounded-[11px] px-4 py-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>

                <div className="flex items-center space-x-2 border border-muted rounded-[11px] px-4 py-2">
                  <RadioGroupItem value="creator" id="creator" />
                  <Label htmlFor="creator">Creator</Label>
                </div>
              </RadioGroup>

              {accountType === "creator" ? (
                <p className="text-sm text-secondary mt-2">
                  Your profile will be created as a student account. Once your
                  creator request is reviewed and approved by our team, you’ll
                  gain access to creator tools and features.
                </p>
              ) : null}
            </div>

            <div className="w-fit">
              <Label htmlFor="SocialLinks">
                Social Links
                {accountType === "creator" ? (
                  <span className="align-top text-error">*</span>
                ) : (
                  <span className="align-top text-tertiary text-sm ">
                    (Optional)
                  </span>
                )}
              </Label>
              <div className="relative w-full">
                <FileUser className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary mt-0.5 z-5" />
                <Input
                  className="mt-2 pl-15"
                  id="PortfolioLink"
                  placeholder="Enter your portfolio link"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                />
              </div>
              <div className="relative w-full">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary mt-0.5 z-5" />
                <Input
                  className="mt-2 pl-15"
                  id="LinkedinLink"
                  placeholder="Enter your LinkedIn link"
                  value={linkedinLink}
                  onChange={(e) => setLinkedinLink(e.target.value)}
                />
              </div>
              <div className="relative w-full">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary mt-0.5 z-5" />
                <Input
                  className="mt-2 pl-15"
                  id="GithubLink"
                  placeholder="Enter your GitHub link"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                />
              </div>
            </div>
          </div>
          {error && (
            <p className="text-sm text-error mt-2 text-center">{error}</p>
          )}

          {/* Submit */}
          <div className="w-full justify-center">
            <Button
              disabled={isDisabled}
              onClick={handleSubmit}
              className="mt-8 bg-accent w-full text-background px-6 py-2 rounded-[10px] font-medium hover:bg-accent/90 transition"
            >
              {isDisabled
                ? "Please fill all required fields "
                : "Save and Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
