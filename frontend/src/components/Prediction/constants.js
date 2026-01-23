// Constants and configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export const minimum_loading_time = 800;

export const fuel_types = [
  { value: "X", label: "Regular Gasoline" },
  { value: "Z", label: "Premium Gasoline" },
  { value: "E", label: "Ethanol (E85)" },
  { value: "D", label: "Diesel" },
  { value: "N", label: "Natural Gas" }
];

export const initial_form_state = {
  fuel_type: "",
  cylinders: "",
  engine_size: ""
};

export const select_style = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "1em",
  paddingRight: "2.5rem"
};
