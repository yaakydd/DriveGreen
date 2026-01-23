import React from "react";
import { motion } from "framer-motion";
import { Leaf, Fuel, Cylinder, Gauge, Zap } from "lucide-react";
import DriveGreenLogo from "../DriveGreenLogo";
import { fuel_types, select_style } from "./constants";

const FormView = ({
  form,
  handleChange,
  handleSubmit,
  isFormValid,
  variants
}) => {
  return (
    <motion.div
      key="form"
      {...variants.form}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative group">
        <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-r from-emerald-500/70 via-cyan-500/70 to-teal-500/70 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />

        <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 py-4 px-5 md:py-6 md:px-8 overflow-hidden">
          <div className="flex flex-col items-center mb-4 md:mb-6">
            <motion.div {...variants.logo}>
              <DriveGreenLogo size="large" />
            </motion.div>

            <h2 className="mt-3 text-lg md:text-xl font-bold text-slate-900 tracking-tight text-center">
              Vehicle Carbon Emissions Predictor
            </h2>

            <p className="mt-1 md:mt-2 text-slate-600 text-sm md:text-base font-medium flex items-center gap-2">
              <Leaf className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" />
              Determines your vehicle's carbon emissions value
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <motion.div className="space-y-1 md:space-y-2" {...variants.input.fuel}>
              <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-emerald-600">
                <Fuel className="w-4 h-4 md:w-5 md:h-5" />
                Fuel Type
              </label>

              <select
                name="fuel_type"
                value={form.fuel_types}
                onChange={handleChange}
                required
                style={select_style}
                className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-300 rounded-lg md:rounded-xl text-slate-800 text-sm md:text-base focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm hover:border-emerald-400 cursor-pointer appearance-none"
              >
                <option value="" disabled>Select fuel type</option>
                {fuel_types.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </motion.div>

            <motion.div className="space-y-2 md:space-y-2" {...variants.input.cylinders}>
              <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-emerald-600">
                <Cylinder className="w-4 h-4 md:w-5 md:h-5" />
                Number of Cylinders
              </label>

              <input
                name="cylinders"
                value={form.cylinders}
                onChange={handleChange}
                required
                type="number"
                min="3"
                max="16"
                placeholder="Enter value between 3-16"
                className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-300 rounded-lg md:rounded-xl text-slate-800 text-sm md:text-base placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-sm"
              />
            </motion.div>

            <motion.div className="space-y-2 md:space-y-2" {...variants.input.engine}>
              <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-emerald-600">
                <Gauge className="w-4 h-4 md:w-5 md:h-5" />
                Engine Size (Liters)
              </label>

              <input
                name="engine_size"
                value={form.engine_size}
                onChange={handleChange}
                required
                type="number"
                step="0.1"
                min="0.9"
                max="8.4"
                placeholder="Enter value between 0.9-8.4"
                className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-300 rounded-lg md:rounded-xl text-slate-800 text-sm md:text-base placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-sm"
              />
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(15, 141, 99, 0.7)" }}
              whileTap={{ scale: 0.95 }}
              disabled={!isFormValid}
              className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-sm transition-all flex items-center justify-center gap-2 mt-3 md:mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative z-10">Calculate Emission</span>
              <Zap className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
            </motion.button>
          </form>

          <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm text-slate-600 gap-2 sm:gap-4">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="w-3 h-3 bg-green-600 rounded-full block" />
                </motion.div>
                <span className="font-medium">AI-Powered Prediction</span>
              </div>

              <div className="hidden sm:block w-px h-4 bg-gray-300 mx-2" />

              <div className="text-xs md:text-sm text-slate-500 text-center sm:text-right whitespace-nowrap">
                Data provided by EPA & Transport Canada standards.
              </div>
            </div>
          </div>

          <motion.div
            {...variants.corners.topLeft}
            className="absolute top-4 left-4 w-14 h-14 md:top-4 md:left-4 md:w-16 md:h-16 border-l-5 border-t-5 border-emerald-400/70 rounded-tl-2xl"
          />
          <motion.div
            {...variants.corners.bottomRight}
            className="absolute bottom-4 right-4 w-14 h-14 md:bottom-4 md:right-4 md:w-16 md:h-16 border-r-5 border-b-5 border-emerald-400/70 rounded-br-2xl"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FormView;
