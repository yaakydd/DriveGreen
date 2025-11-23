import React, { useState } from "react";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import ResultCard from "./AnimationCardCard";
import fetchWithMinDelay from "../utils/min";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/predict/";

export default function PredictionFormD() {
  const [form, setForm] = useState({ fuel_type: "", cylinders: "", engine_size: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(e) { setForm(s => ({ ...s, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const payload = { fuel_type: form.fuel_type, cylinders: +form.cylinders, engine_size: +form.engine_size };
      const json = await fetchWithMinDelay(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, 900);
      setResult(json.predicted_CO2);
    } catch (err) { alert(err.message || "Error"); }
    finally { setLoading(false); }
  }

  const reset = () => { setForm({ fuel_type: "", cylinders: "", engine_size: "" }); setResult(null); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06071a] via-[#0b1226] to-[#041022] flex items-center justify-center p-6 relative overflow-hidden">
      {/* faint neon particles */}
      <motion.div className="absolute inset-0" animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ duration: 6, repeat: Infinity }} />

      <div className="relative z-10 w-full max-w-md">
        {!loading && !result && (
          <form onSubmit={handleSubmit} className="bg-[#071029]/80 border border-[#0b74ff]/20 rounded-2xl p-6 shadow-lg backdrop-blur">
            <h2 className="text-2xl font-bold text-white mb-2">CO₂ Neon</h2>
            <p className="text-sm text-slate-300 mb-4">Futuristic vehicle emissions estimate</p>

            <div className="space-y-3">
              <select name="fuel_type" value={form.fuel_type} onChange={handleChange} required className="w-full p-2 bg-transparent border border-slate-700 rounded">
                <option value="">Fuel Type</option><option value="X">X</option><option value="Z">Z</option><option value="E">E</option><option value="D">D</option><option value="N">N</option>
              </select>
              <input name="cylinders" value={form.cylinders} onChange={handleChange} type="number" className="w-full p-2 bg-transparent border border-slate-700 rounded" placeholder="Cylinders" />
              <input name="engine_size" value={form.engine_size} onChange={handleChange} step="0.1" type="number" className="w-full p-2 bg-transparent border border-slate-700 rounded" placeholder="Engine size (L)" />
            </div>

            <button className="mt-5 w-full bg-gradient-to-r from-[#00e0a6] to-[#00b4ff] text-black font-semibold p-3 rounded-lg" type="submit">Predict</button>
          </form>
        )}

        {loading && <div className="flex justify-center"><Spinner size={104} message="Analyzing emissions…" /></div>}

        {!loading && result && <ResultCard result={Number(result)} onBack={reset} />}
      </div>
    </div>
  );
}
