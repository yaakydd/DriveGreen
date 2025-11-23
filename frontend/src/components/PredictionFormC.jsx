import React, { useState } from "react";
import Spinner from "./Spinner";
import ResultCard from "./ResultCard";
import fetchWithMinDelay from "../utils/fetchWithMinDelay";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/predict/";

export function PredictionFormC() {
  const [form, setForm] = useState({ fuel_type: "", cylinders: "", engine_size: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(e) { setForm(s => ({ ...s, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const payload = { fuel_type: form.fuel_type, cylinders: +form.cylinders, engine_size: +form.engine_size };
      const json = await fetchWithMinDelay(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, 500);
      setResult(json.predicted_CO2);
    } catch (err) { alert(err.message || "Error"); }
    finally { setLoading(false); }
  }

  const reset = () => { setForm({ fuel_type: "", cylinders: "", engine_size: "" }); setResult(null); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        {!loading && !result && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">CO₂ Quick Check</h1>
              <div className="text-sm text-gray-500">Fast • Minimal</div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <select name="fuel_type" value={form.fuel_type} onChange={handleChange} required className="p-2 border rounded">
                <option value="">Fuel Type</option><option value="X">X</option><option value="Z">Z</option><option value="E">E</option><option value="D">D</option><option value="N">N</option>
              </select>
              <input name="cylinders" value={form.cylinders} onChange={handleChange} type="number" className="p-2 border rounded" placeholder="Cylinders" />
              <input name="engine_size" value={form.engine_size} onChange={handleChange} step="0.1" type="number" className="p-2 border rounded" placeholder="Engine Size (L)" />
            </div>

            <button className="mt-4 w-full bg-slate-800 text-white p-3 rounded" type="submit">Estimate</button>
          </form>
        )}

        {loading && <div className="flex justify-center"><Spinner size={80} message="Working…" /></div>}

        {!loading && result && <ResultCard result={Number(result)} onBack={reset} />}
      </div>
    </div>
  );
}
// ===== EXPORT =====
// Export component as default export so it can be imported elsewhere
// Usage: import PredictionForm from './components/PredictionForm'
export default PredictionFormC;
