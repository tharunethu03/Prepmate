"use client";

import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";

interface InterviewFormProps {
  onFinish: () => void;
}

export default function InterviewForm({ onFinish }: InterviewFormProps) {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white border-2 border-accent px-5 md:px-10 py-10 rounded-[22px] max-w-6xl h-[80vh] md:h-[90vh] w-[90%] md:w-full relative flex flex-col mx-5 md:mx-0">
        <button className="absolute top-5 right-5" onClick={onFinish}>
          <X className="text-tertiary hover:text-secondary cursor-pointer" />
        </button>

        <h2>Create Interview</h2>
        <p className="sub-text">
          Customize your interview experience for targeted preparation
        </p>
        <hr className="border border-border my-5" />
        <form>
          <div className="flex flex-row items-center justify-between">
            <div>
              <Label>
                Title <span className="align-top text-error">*</span>
              </Label>
              <Input
                className="mt-2"
                id="title"
                placeholder="Enter interview title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>
                Category / Role <span className="align-top text-error">*</span>
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
                placeholder="Choose the category"
                onChange={(value) => setRole(value)}
              />
            </div>
            
          </div>
          <div className="mt-5">
              <Label>
                Description <span className="align-top text-error">*</span>
              </Label>
              <Input
                className="mt-2"
                id="description"
                placeholder="Enter interview description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
        </form>
      </div>
    </div>
  );
}
