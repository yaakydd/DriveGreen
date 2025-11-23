import React from "react";
import PredictionForm from "./components/PredictionForma";
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