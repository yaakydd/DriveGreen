import React, { useState } from "react";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import ResultCard from "./AnimationCard";
import fetchWithMinDelay from "../utils/min";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/predict/";

const bgLocal = "/car_co2_bg.jpg"; // put image in public/
const uploadedPath = "/mnt/data/A_2D_digital_illustration_compares_positive_and_ne.png"; // fallback in dev env
const PredictionFormA = () => {
  const [form, setForm] = useState({ fuel_type: "", cylinders: "", engine_size: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(e) {
    setForm(s => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        fuel_type: form.fuel_type,
        cylinders: Number(form.cylinders),
        engine_size: Number(form.engine_size),
      };
      const json = await fetchWithMinDelay(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, 800);
      setResult(json.predicted_CO2 ?? json.predicted_co2 ?? json.co2_emissions ?? null);
    } catch (err) {
      alert(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setForm({ fuel_type: "", cylinders: "", engine_size: "" });
    setResult(null);
  }

  return (
    <div className="min-h-screen relative">
      {/* Background image (cover, dimmed) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgLocal}), linear-gradient(90deg, rgba(6,9,15,0.55), rgba(6,12,20,0.55))`,
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Moving car */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: "22%" }}
        animate={{ x: ["-20vw", "120vw"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <svg width="160" height="80" viewBox="0 0 160 80" className="drop-shadow-2xl">
          <rect x="20" y="35" width="120" height="24" rx="6" fill="#10B981" />
          <path d="M44 35 L54 20 L106 20 L116 35 Z" fill="#34D399"/>
          <circle cx="56" cy="62" r="10" fill="#111827"/>
          <circle cx="104" cy="62" r="10" fill="#111827"/>
          <rect x="18" y="46" width="6" height="6" rx="2" fill="#374151"/>
        </svg>
      </motion.div>

      {/* Form/Spinner/Result container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {!loading && !result && (
            <form onSubmit={handleSubmit} className="bg-white/90 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">CO₂ Emission Predictor</h2>
              <p className="text-sm text-gray-600 mb-4">Quick estimate of vehicle CO₂ (g/km)</p>

              <label className="text-sm font-medium">Fuel Type</label>
              <select name="fuel_type" value={form.fuel_type} onChange={handleChange} required
                className="w-full p-2 border rounded mb-3">
                <option value="">Choose fuel type</option>
                <option value="X">X</option>
                <option value="Z">Z</option>
                <option value="E">E</option>
                <option value="D">D</option>
                <option value="N">N</option>
              </select>

              <label className="text-sm font-medium">Cylinders</label>
              <input name="cylinders" value={form.cylinders} onChange={handleChange} required type="number"
                className="w-full p-2 border rounded mb-3" placeholder="4" />

              <label className="text-sm font-medium">Engine Size (L)</label>
              <input name="engine_size" value={form.engine_size} onChange={handleChange} required
                type="number" step="0.1" className="w-full p-2 border rounded mb-4" placeholder="2.0" />

              <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold" type="submit">Predict CO₂ Emission</button>
            </form>
          )}

          {loading && (
            <div className="flex justify-center">
              <Spinner size={112} message="Estimating emissions..." />
            </div>
          )}

          {!loading && result && (
            <ResultCard result={Number(result)} onBack={resetAll} />
          )}
        </div>
      </div>
    </div>
  );
}
export default PredictionFormA;