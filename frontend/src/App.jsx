import React from "react";
import PredictionForm from "./components/Prediction/PredictionForm";
import Chatbot from "./components/Chatbot";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <PredictionForm />
      <Chatbot />
      <Toaster position="top-center" />
    </>
  );
}