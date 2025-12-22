import React from "react";
import PredictionForm from "./components/PredictionForm";
import Chatbot from "./components/Chatbot";
import BackgroundParticles from "./components/BackgroundParticles";
import NeonCar from "./components/NeonCar";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-slate-950 overflow-hidden pointer-events-none">
        <BackgroundParticles />
        <NeonCar />
      </div>
      <main className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 md:p-6 lg:p-12 overflow-x-hidden">
        <PredictionForm />
      </main>
      <Chatbot />
      <Toaster position="top-center" />
    </>
  );
}