import ProfileForm from "./ProfileForm";

const page = () => {
  return (
    <div className="w-full px-10 flex flex-col ">
      {/* Header */}
      <div className="flex-col items-start ">
        <h1 className="text-4xl font-bold">Profile Setup</h1>
        <p className="text-sm text-secondary">
          Set up your profile to start your prep journey.
        </p>
      </div>

      <hr className="flex-1 border-muted mt-5" />

      <ProfileForm />
    </div>
  );
};

export default page;
