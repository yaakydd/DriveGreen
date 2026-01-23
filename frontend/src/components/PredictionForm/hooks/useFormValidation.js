import { useMemo } from "react";

const useFormValidation = (form) => {
  return useMemo(() => 
    Boolean(form.fuel_type && form.cylinders && form.engine_size),
    [form.fuel_type, form.cylinders, form.engine_size]
  );
};

export default useFormValidation;
