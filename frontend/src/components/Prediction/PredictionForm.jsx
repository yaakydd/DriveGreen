import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import NeonCar from "../NeonCar";
import AnimatedParticles from "../BackgroundParticles";
import Chatbot from "../Chatbot";
import toast from "react-hot-toast";

import  useAnimationVariants  from "./hooks/useAnimationVariants";
import  useFormValidation from "./hooks/useFormValidation";
import  usePrediction  from "./hooks/usePrediction";
import { initial_form_state } from "./constants";
import FormView from "./FormView";
import LoadingView from "./LoadingView";
import ResultView from "./ResultView";

const PredictionForm = () => {
  // State
  const [form, setForm] = useState(initial_form_state);
  
  // Custom hooks
  const variants = useAnimationVariants();
  const isFormValid = useFormValidation(form);
  const { prediction, loading, makePrediction, resetPrediction } = usePrediction();

  // Event handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill all fields.", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />
      });
      return;
    }

    await makePrediction(form);
  }, [form, isFormValid, makePrediction]);

  const handleReset = useCallback(() => {
    resetPrediction();
    setForm(initial_form_state);
  }, [resetPrediction]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 font-sans">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-emerald-600/20 blur-[150px] opacity-15"
          style={{ clipPath: "ellipse(60% 70% at 20% 50%)" }}
        />
        <div
          className="absolute inset-0 bg-cyan-500/20 blur-[150px] opacity-15"
          style={{ clipPath: "ellipse(60% 70% at 80% 50%)" }}
        />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatedParticles />
      </div>

      {/* Neon car */}
      {!loading && !prediction && <NeonCar />}

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingView variants={variants} />
          ) : prediction ? (
            <ResultView 
              prediction={prediction} 
              onReset={handleReset} 
              variants={variants}
            />
          ) : (
            <FormView
              form={form}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isFormValid={isFormValid}
              variants={variants}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Chatbot with prediction context */}
      <Chatbot predictionData={prediction} />
    </div>
  );
};

export default PredictionForm;
