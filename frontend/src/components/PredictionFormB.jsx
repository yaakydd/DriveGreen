import React, { useState } from "react";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import ResultCard from "./AnimationCard";
import fetchWithMinDelay from "../utils/min";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/predict/";

export default function PredictionFormB() {
  const [form, setForm] = useState({ fuel_type: "", cylinders: "", engine_size: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(e) { setForm(s => ({ ...s, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const payload = { fuel_type: form.fuel_type, cylinders: +form.cylinders, engine_size: +form.engine_size };
      const json = await fetchWithMinDelay(API, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      }, 600);
      setResult(json.predicted_CO2);
    } catch (err) { alert(err.message || "Error"); }
    finally { setLoading(false); }
  }

  function reset() { setForm({ fuel_type: "", cylinders: "", engine_size: "" }); setResult(null); }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="absolute left-6 bottom-8">
        {/* Stylized eco car moving */}
        <motion.div animate={{ x: [0, 300, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
          <svg width="160" height="80" viewBox="0 0 160 80">
            <rect x="20" y="36" width="120" height="22" rx="10" fill="#06b6d4" />
            <path d="M48 36 L60 18 L100 18 L114 36 Z" fill="#34d399" />
            <circle cx="56" cy="62" r="10" fill="#0f172a" />
            <circle cx="104" cy="62" r="10" fill="#0f172a" />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {!loading && !result && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-2 text-sky-700">CO₂ Studio</h3>
            <p className="text-sm text-gray-500 mb-4">Stylized quick estimate for your vehicle</p>

            <label className="text-sm">Fuel Type</label>
            <select name="fuel_type" value={form.fuel_type} onChange={handleChange} required className="w-full p-2 border rounded mb-3">
              <option value="">Select</option><option value="X">X</option><option value="Z">Z</option><option value="E">E</option><option value="D">D</option><option value="N">N</option>
            </select>

            <label className="text-sm">Cylinders</label>
            <input name="cylinders" value={form.cylinders} onChange={handleChange} type="number" className="w-full p-2 border rounded mb-3" />

            <label className="text-sm">Engine Size (L)</label>
            <input name="engine_size" value={form.engine_size} onChange={handleChange} step="0.1" type="number" className="w-full p-2 border rounded mb-4" />

            <button className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg" type="submit">Predict</button>
          </form>
        )}

        {loading && <div className="flex justify-center"><Spinner size={96} message="Crunching numbers…" /></div>}

        {!loading && result && <ResultCard result={Number(result)} onBack={reset} />}
      </div>
    </div>
  );
}
