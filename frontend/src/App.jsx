import React from "react";
import PredictionForm from "./components/PredictionForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        CO₂ Emission Predictor
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Enter your vehicle details to predict CO₂ emissions.
      </p>
      <PredictionForm />
    </div>
  );
}
