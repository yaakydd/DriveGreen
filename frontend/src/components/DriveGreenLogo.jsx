// Define the functional component, accepting 'size' prop with a default value of "large"
const DriveGreenLogo = ({ size = "large" }) => {
  // Define configuration objects for different logo sizes (in Tailwind utility units)
  const sizes = {
    small: { logo: 40, text: "text-2xl" }, // 40px logo width/height, text size 2xl
    normal: { logo: 56, text: "text-3xl" }, // 56px logo width/height, text size 3xl
    large: { logo: 72, text: "text-5xl" }  // 72px logo width/height, text size 5xl
  };

  // Destructure the logo size and text size based on the 'size' prop
  const { logo, text } = sizes[size];
  // Define a utility class for the primary green color
  const colorClass = "text-green-600";

  // The component returns a container that centers the text logo
  return (
    <div className="flex items-center ">
      {/* flex: Enable flexbox, items-center: Vertically align items */} 
      {/*  TEXT LOGO (The words "Drive Green") */}
      <div className={`flex items-center font-bold tracking-tight ${text} `}>
        {/* flex items-center: Aligns text vertically, font-bold tracking-tight: Style for the text, ${text}: Inserts the dynamic text size class (e.g., text-3xl) */}
        <span className="text-slate-800">Drive</span>
        {/* The first word in dark gray */}
        <span className={colorClass}>Green</span>
        {/* The second word uses the defined green highlight color */}
      </div>
    </div>
  );
};

export default DriveGreenLogo;