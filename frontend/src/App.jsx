import React from "react";
import PredictionForm from "./components/PredictionForm";
import Chatbot from "./components/Chatbot";
import BackgroundAurora from "./components/BackgroundAurora";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <BackgroundAurora />
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <PredictionForm />
      </main>
      <Chatbot />
      <Toaster position="top-center" />
    </>
  );
}