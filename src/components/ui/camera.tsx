"use client";
import React, { useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

const CameraComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const isSpeaking = true;

  const session = useSession();
  const avatar = session.data?.user?.avatar;

  // Start the camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
      setCameraOn(true);
    } catch (err) {
      console.error("Failed to access camera:", err);
      alert("Camera access denied or not available.");
    }
  };

  // Stop the camera completely
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // stops camera
    }
    setStream(null);
    setCameraOn(false);
  };

  const toggleCamera = () => {
    if (cameraOn) stopCamera();
    else startCamera();
  };

  // Start mic independently
  const startMic = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      // merge audio tracks with existing stream if camera is on
      if (stream) {
        audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
        setStream(stream);
      } else {
        setStream(audioStream);
      }
      setMicOn(true);
    } catch (err) {
      console.error("Failed to access mic:", err);
      alert("Microphone access denied or not available.");
    }
  };

  // Stop mic completely
  const stopMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => track.stop());
      if (!cameraOn) setStream(null);
    }
    setMicOn(false);
  };

  // Toggle mic
  const toggleMic = () => {
    if (micOn) stopMic();
    else startMic();
  };

  return (
    <div className="relative w-full h-full rounded-b-[22px] overflow-hidden">
      <p className="absolute top-0 right-0 z-10 p-2 bg-accent/50 rounded-bl-[12px] text-foreground text-sm">{session.data?.user?.name}</p>
      
      {!cameraOn && (
        <>
          <Image
            src={avatar || "/profile-setup/avatar1.png"}
            width={120}
            height={120}
            alt="AVATAR"
            className="absolute inset-0 m-auto rounded-full border-3 border-background ring-3 ring-accent z-3"
          />
          {isSpeaking && (
            <span className="absolute inset-0 m-auto inline-flex w-25 h-25 animate-ping rounded-full bg-accent/75 z-2" />
          )}
        </>
      )}
      {!cameraOn && (
        <div>
          <div className="absolute inset-0 bg-background" />
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-cover bg-background"
        autoPlay
        muted={!micOn}
        playsInline
      />
      <button
        onClick={toggleCamera}
        className="absolute bottom-4 right-4 z-10 p-3 rounded-full bg-foreground hover:background shadow-lg flex items-center justify-center"
      >
        {cameraOn ? (
          <CameraOff className="w-5 h-5 text-error" />
        ) : (
          <Camera className="w-5 h-5 text-success" />
        )}
      </button>

      <button
        onClick={toggleMic}
        className="absolute bottom-4 right-20 z-10 p-3 rounded-full bg-foreground hover:bg-foreground/90 shadow-lg flex items-center justify-center"
      >
        {micOn ? (
          <Mic className="w-5 h-5 text-success" />
        ) : (
          <MicOff className="w-5 h-5 text-error" />
        )}
      </button>
    </div>
  );
};

export default CameraComponent;
