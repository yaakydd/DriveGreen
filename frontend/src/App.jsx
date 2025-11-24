import React from "react";
import PredictionFormA from "./components/PredictionFormA";
import Chatbot from "./components/Chatbot";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <PredictionFormA />
      <Chatbot />
      <Toaster position="top-center" />
    </>
  );
}