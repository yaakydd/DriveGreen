import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import AnimatedCard from "./AnimatedCard";

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    fuel_type: "",
    cylinders: "",
    engine_size: "",
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const res = await axios.post("http://127.0.0.1:8000/predict", formData);
      setPrediction(res.data.prediction.toFixed(2));
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Error connecting to backend. Make sure it's running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-gray-700 mb-2 font-medium">
          Fuel Type
        </label>
        <select
          name="fuel_type"
          value={formData.fuel_type}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        >
          <option value="">Select Fuel Type</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Ethanol">Ethanol</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">
          Number of Cylinders
        </label>
        <input
          type="number"
          name="cylinders"
          value={formData.cylinders}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="e.g., 4"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">
          Engine Size (L)
        </label>
        <input
          type="number"
          step="0.1"
          name="engine_size"
          value={formData.engine_size}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="e.g., 2.0"
          required
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all"
      >
        {loading ? "Predicting..." : "Predict CO₂ Emission"}
      </motion.button>

      {loading && <Spinner />}

      {prediction && (
        <AnimatedCard>
          Estimated CO₂ Emission:{" "}
          <span className="font-bold text-green-700">{prediction} g/km</span>
        </AnimatedCard>
      )}
    </form>
  );
};

export default PredictionForm;
