import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { AlertCircle, AlertTriangle, Globe } from "lucide-react";
import { API_URL, minimum_loading_time } from "../constants";

const usePrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const makePrediction = useCallback(async (form) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setPrediction(null);
    setLoading(true);

    try {
      const payload = {
        fuel_type: form.fuel_type,
        cylinders: parseInt(form.cylinders, 10),
        engine_size: parseFloat(form.engine_size)
      };

      const startTime = performance.now();

      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        let errorMsg = "Prediction failed";
        try {
          const errorBody = await res.json();
          errorMsg = errorBody.detail || errorBody.message || errorMsg;
        } catch {
          // Use default
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();

      const elapsedTime = performance.now() - startTime;
      const remainingTime = MIN_LOADING_TIME - elapsedTime;

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Store prediction with form data for chatbot context
      const predictionWithContext = {
        ...data,
        vehicleData: {
          fuel_type: form.fuel_type,
          cylinders: parseInt(form.cylinders, 10),
          engine_size: parseFloat(form.engine_size)
        }
      };

      setPrediction(predictionWithContext);

      toast.success("Prediction successful!", {
        icon: <Globe className="w-5 h-5 text-blue-700" />,
        style: { background: "#10b981", color: "#fff" }
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      
      console.error(err);
      toast.error(err.message || "Prediction failed. Check your inputs.", {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const resetPrediction = useCallback(() => {
    setPrediction(null);
    setLoading(false);
  }, []);

  return {
    prediction,
    loading,
    makePrediction,
    resetPrediction
  };
};

export default usePrediction;
