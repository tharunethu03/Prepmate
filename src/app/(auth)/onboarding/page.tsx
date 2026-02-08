"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion";

interface OnboardingOverlayProps {
  onFinish: () => void;
}

const onboardingSlides = [
  {
    id: 1,
    title: "Practice Smarter with AI",
    subtitle: "Step into real interview simulations powered by AI",
    description:
      "PREPMATE’s intelligent interviewer adapts to your skill level, asking realistic questions and giving instant, personalized feedback. Build confidence and sharpen your communication all in a safe, judgment free space.",
    image: "/login/onboarding1.png",
  },
  {
    id: 2,
    title: "Track Your Growth",
    subtitle: "See how far you’ve come, one interview at a time",
    description:
      "Your profile shows your progress, accuracy, and confidence trends after every session. Visual stats help you focus on areas that matter most so you’re always improving, not just practicing.",
    image: "/login/onboarding2.png",
  },
  {
    id: 3,
    title: "Compete & Climb the Leaderboard",
    subtitle: "Turn preparation into progress and progress into victory",
    description:
      "Earn XP, unlock badges, and rise through the leaderboard as you complete interviews and challenges. PREPMATE makes learning fun, competitive, and rewarding so every effort counts.",
    image: "/login/onboarding3.png",
  },
  {
    id: 4,
    title: "Learn Together with Peers",
    subtitle: "Collaboration fuels growth",
    description:
      "Challenge friends, join peer interviews, or share feedback in the community. PREPMATE helps you grow together turning preparation into a shared journey toward success.",
    image: "/login/onboarding4.png",
  },
];
export default function OnboardingOverlay({
  onFinish,
}: OnboardingOverlayProps) {
  const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);

      setCurrentSlide((prev) => {
        if (prev < onboardingSlides.length - 1) {
          return prev + 1;
        }
        return prev; // stop at last slide
      });
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slideVariants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 60 : -60,
    }),

    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: easeOut,
      },
    },

    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -60 : 60,
      transition: {
        duration: 0.3,
        ease: easeIn,
      },
    }),
  };

  const nextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    } else {
      setIsFinishing(true);
    }
  };

  const prevSlide = () => {
    setDirection(-1);
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const skip = () => {
    setIsFinishing(true); // trigger logo animation + fade out slides
  };

  const isImageLeft = [1, 3].includes(onboardingSlides[currentSlide].id);

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white border-2 border-accent px-5 md:px-10 py-10 rounded-[22px] max-w-6xl h-[70vh] md:h-[80vh] w-[90%] md:w-full relative flex flex-col mx-5 md:mx-0">
        <AnimatePresence>
          <motion.div
            key="logo"
            initial={{
              scale: 1,
              x: 0,
              y: 0,
              position: "relative",
            }}
            animate={
              isFinishing
                ? {
                    scale: 2.5,
                    x: 0,
                    y: "30vh",
                  }
                : {}
            }
            transition={{
              duration: 1,
              ease: "easeInOut",
            }}
            onAnimationComplete={() => {
              if (isFinishing) {
                setTimeout(onFinish, 200);
              }
            }}
            className="mx-auto"
          >
            <Image
              src="/login/logo-text.png"
              width={140}
              height={48}
              alt="Logo Text"
            />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {!isFinishing && (
            <motion.div
              key="content"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="flex flex-col grow"
            >
              <div className="flex flex-col grow">
                <div className="flex flex-row justify-between items-center left-[50%]">
                  <span />

                  {onboardingSlides[currentSlide].id === 4 ? (
                    <div className="flex flex-row text-background text-sm items-center ">
                      Skip
                      <ChevronsRight size={20} />
                    </div>
                  ) : (
                    <button
                      onClick={skip}
                      className="flex flex-row text-secondary text-sm items-center hover:text-accent transition cursor-pointer"
                    >
                      Skip
                      <ChevronsRight size={20} />
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-row items-center h-full gap-6 px-5"
                  >
                    {isImageLeft && (
                      <Image
                        src={onboardingSlides[currentSlide].image}
                        width={300}
                        height={200}
                        alt={onboardingSlides[currentSlide].title}
                        className="hidden md:block w-auto max-w-sm mx-auto"
                      />
                    )}

                    <div className="flex flex-col items-start text-left w-full md:w-1/2 px-4 md:px-0">
                      <h1 className="text-accent font-bold mb-2 text-xl md:text-2xl">
                        {onboardingSlides[currentSlide].title}
                      </h1>

                      <p className="mb-2 text-base md:text-lg text-secondary font-semibold">
                        {onboardingSlides[currentSlide].subtitle}
                      </p>

                      <p className="text-sm md:text-base text-tertiary mb-4">
                        {onboardingSlides[currentSlide].description}
                      </p>
                    </div>

                    {!isImageLeft && (
                      <Image
                        src={onboardingSlides[currentSlide].image}
                        width={300}
                        height={200}
                        alt={onboardingSlides[currentSlide].title}
                        className="hidden md:block w-auto max-w-sm mx-auto"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex flex-row justify-between items-center mt-auto">
                  {onboardingSlides[currentSlide].id === 1 ? (
                    <div className="flex flex-row text-background text-sm items-center">
                      <ChevronLeft size={20} />
                      Back
                    </div>
                  ) : (
                    <button
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                      className="flex flex-row text-secondary text-sm items-center hover:text-accent transition cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                      Back
                    </button>
                  )}

                  <div className="relative flex items-center space-x-3">
                    {/* Static dots */}
                    {onboardingSlides.map((_, index) => (
                      <div
                        key={index}
                        onClick={() => goToSlide(index)}
                        className="w-3 h-3 rounded-full bg-gray-300 cursor-pointer"
                      />
                    ))}

                    {/* Animated active dot */}
                    <motion.div
                      className="absolute w-3 h-3 rounded-full bg-accent"
                      initial={false}
                      animate={{
                        x: currentSlide * 24, // distance between dots
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  </div>

                  <button
                    onClick={nextSlide}
                    className="flex flex-row text-secondary text-sm items-center hover:text-accent transition cursor-pointer"
                  >
                    {currentSlide === onboardingSlides.length - 1
                      ? "Finish"
                      : "Next"}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
