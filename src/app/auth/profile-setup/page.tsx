"use client";

import { useState } from "react";
import Image from "next/image";
import { avatars } from "@/data/avatars";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const page = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [fullName, setFullName] = useState("");
  const [field, setField] = useState("");
  const [role, setRole] = useState("");
  const [accountType, setAccountType] = useState("");

  const handleSubmit = () => {
    const data = {
      fullName,
      field,
      role,
      accountType,
      avatar: selectedAvatar,
    };

    console.log("Final Profile Data:", data);
  };

  return (
    <div className="w-full px-10">
      {/* Header */}
      <div className="flex-col items-start">
        <h1 className="text-4xl font-bold">Profile Setup</h1>
        <p className="text-sm text-secondary">
          Set up your profile to start your prep journey.
        </p>
      </div>

      <hr className="flex-1 border-muted mt-5" />

      <div className="flex flex-col md:flex-row justify-evenly items-center gap-10">
        {/* LEFT SIDE – Avatars */}
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-6 mt-10">
            <Image
              src={selectedAvatar}
              width={120}
              height={120}
              alt="Selected Avatar"
              className="rounded-full border-4 border-foreground ring-3 ring-accent shadow-md"
            />
            <p className="text-base font-medium">Choose your Avatar</p>
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
                id="FullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Industry / Field */}
            <div>
              <Label htmlFor="Field">
                Industry / Field<span className="align-top text-error">*</span>
              </Label>

              <Dropdown
                className="mt-2"
                options={[
                  "Software Engineering",
                  "UI/UX",
                  "Cybersecurity",
                  "Mobile Development",
                  "Machine Learning / AI",
                ]}
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
                onChange={(value) => setRole(value)}
              />
            </div>

            {/* Account Type */}
            <div>
              <Label htmlFor="AccountType">
                Account Type<span className="align-top text-error">*</span>
              </Label>

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
                  Your profile will start as a student account. Once your
                  creator request is reviewed and approved by our team, you’ll
                  gain access to creator tools and features.
                </p>
              ) : null}
            </div>

            <div>
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
              <Input
                className="mt-2"
                id="SocialLinks"
                placeholder="Enter your social media or portfolio links"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="w-full justify-center">
            <Button
              onClick={handleSubmit}
              className="mt-8 bg-accent w-full text-background px-6 py-2 rounded-[10px] font-medium hover:bg-accent/90 transition"
            >
              Save and Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
