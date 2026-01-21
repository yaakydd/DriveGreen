# DriveGreen 
A web application that predicts vehicle carbon emissions and provides personalized recommendations for a greener future.

## Overview:
DriveGreen is an educational tool designed to raise awareness about vehicle carbon emissions. By analyzing key vehicle parameters which are core features and cannot be changed by the vehicle owners that is (fuel type, cylinders, engine size), the application provides accurate emission predictions and actionable insights to help users make more environmentally conscious decisions.

## Key Features:

### Intelligent vehicle carbon emissions predictions
Predict your vehicle's carbon emissions based on:
- Fuel type (regular gasoline, premium gasoline, diesel, ethanol, natural gas)
- Number of cylinders (3-16)
- Engine size (0.9-8.4 liters)

### Detailed Analysis
- Visual gauge showing emission level
- Color-coded categories (Excellent to Very High)
- Clear explanations of environmental impact
- Comparisons with industry benchmarks

### Personalized Recommendations
Receive tailored suggestions to:
- Reduce your carbon footprint
- Improve fuel efficiency
- Consider eco-friendly alternatives
- Optimize driving habits

### Interactive AI Chatbot (Eco-Copilot)
Ask questions and get instant answers about:
- Vehicle emissions and calculations
- Environmental impact
- Eco-friendly driving practices
- Alternative fuel options
- Health effects of emissions
- Cost savings and incentives


### Professional PDF Reports
- Download comprehensive emission analysis
- Includes vehicle specs, recommendations, and benchmarks
- Professionally formatted with visual elements

## Technology Stack

### Frontend (React + Tailwind CSS)
- **React** with **Vite** - Lightning-fast development and builds
- **Tailwind CSS** - Modern utility-first styling
- **Framer Motion** - Smooth, professional animations
- **Lucide React** - Beautiful, consistent icons
- **React Hot Toast** - Elegant toast notifications
- **React Markdown** - Rich text rendering in chatbot
- **jsPDF** - Client-side PDF report generation

**Key Components of Frontend:**
- `PredictionForm.jsx` - Main DriveGreen input form
- `AnimationCard.jsx` - Results displayed with animated gauge
- `Chatbot.jsx` - AI-powered environmental assistant
- `NeonCar.jsx` - Animated background vehicle with CO<sub>2</sub> emissions
- `BackgroundParticles.jsx` - Dynamic particle effects
- `Spinner.jsx` - Loading animation
- `DriveGreenLogo.jsx` - Brand logo component

### Backend (Python + FastAPI)
- **Python 3.8+** - Robust, industry-standard backend
- **FastAPI** - Modern, high-performance API framework
- **scikit-learn** - Machine learning model (xgboost)
- **pandas & numpy** - Data processing and numerical operations
- **uvicorn** - Lightning-fast ASGI server

**Backend Components**
- `app.py` - Main FastAPI application with CORS configuration
- `routers/` - API route handlers
  - `prediction_router.py` - Emission prediction endpoint
- `model/` - Machine learning model
  - `xgboost_model.pkl` - Pre-trained xgboost model
- `requirements.txt` - Python dependencies

## Complete Project Structure

drivegreen/
├── backend/                            # Python Backend
│   ├── app.py                          # FastAPI application
│   ├── routers/
│   │   └── prediction_router.py               # Prediction API routes
│   ├── model/
│   │   └── encoder.pkl 
│   │   └── xgboost_model.pkl 
│   ├── requirements.txt                # Python dependencies
│   ├── venv/                           # Virtual environment (not in git)
│   └── .env                            # Environment variables (optional)
│
├── frontend/                           # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionForm.jsx      # Main form interface
│   │   │   ├── AnimationCard.jsx       # Results with gauge visualization
│   │   │   ├── Chatbot.jsx             # AI environmental assistant
│   │   │   ├── Spinner.jsx             # Loading animation
│   │   │   ├── NeonCar.jsx             # Animated background car
│   │   │   ├── BackgroundParticles.jsx # Floating particle effects
│   │   │   └── DriveGreenLogo.jsx      # Brand logo
│   │   ├── App.jsx                     # Root component
│   │   ├── main.jsx                    # Entry point
│   │   └── index.css                   # Global Tailwind styles
│   ├── public/                         # Static assets
│   │ └── DriveGreenLogo.jpeg           # DriveGreen favicon
│   ├── package.json                    # Node dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind configuration
│   ├── postcss.config.js               # PostCSS configuration
│   └── .env                            # Environment variables
├── .gitignore                          # Git ignore rules
└── README.md                           # This file

## Installation & Setup

### Prerequisites
- **Node.js** v20+ and npm
- **Python** 3.8+
- **Git**

### Frontend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yaakydd/drivegreen.git
cd drivegreen
```

2. **Navigate to frontend and install dependencies**
```bash
cd frontend
npm install
```

3. **Create environment file**
```bash
# Create .env file in frontend directory. (Terminal)
echo "VITE_API_URL=http://127.0.0.1:8000" > .env

#Create .env file in frontend directory (File)
Create a file in frontend and name it .env
Paste this into the file "VITE_API_URL=http://127.0.0.1:8000"
```

4. **Start the development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. **Navigate to backend directory**
```bash
cd ../backend
```

2. **Create and activate virtual environment**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Start the FastAPI server**
```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

The backend API will be available at `http://127.0.0.1:8000`

### Running the Full Application

Open two terminal windows:

**Terminal 1 (Frontend):**
```bash
cd frontend
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app:app --reload
```

Visit `http://localhost:5173` in your browser!

##  API Documentation

### Prediction Endpoint

**POST** `/api/predict`

Predicts CO2 emissions based on vehicle parameters (fuel type, engine size and number of cylinders).

#### Request Body

```json
{
  "fuel_type": "X",
  "cylinders": 4,
  "engine_size": 2.0
}
```

#### Fuel Type Codes

| Code| Fuel Type        |
|-----|------------------|
| `X` | Regular Gasoline |
| `Z` | Premium Gasoline |
| `E` | Ethanol (E85)    |
| `D` | Diesel           |
| `N` | Natural Gas      |

#### Response

```json
{
  "predicted_co2_emissions": 180,
  "category": "Average",
  "interpretation": "Your vehicle produces moderate CO2 emissions. With some optimization in driving habits and regular maintenance, you can reduce your environmental impact. Consider carpooling or using public transport when possible."
}
```

#### Emission Categories

| Category | CO₂ Range (g/km) | Color | Description |
|----------|------------------|-------|-------------|
| **Excellent** | < 120 | 🟢 Green | Very low emissions, eco-friendly |
| **Good** | 120-160 | 🟢 Light Green | Low emissions, efficient vehicle |
| **Average** | 160-200 | 🟡 Yellow | Moderate emissions, room for improvement |
| **High** | 200-250 | 🟠 Orange | High emissions, consider optimization |
| **Very High** | > 250 | 🔴 Red | Very high emissions, major changes recommended |

### API Documentation Page

Visit **`http://127.0.0.1:8000/docs`** for interactive API documentation (Swagger UI)

## How to Use DriveGreen

### Making a Prediction

1. **Open the Application**
   - Visit the DriveGreen website
   - See the animated interface with floating particles and neon car

2. **Enter Your Vehicle Details**
   - **Fuel Type**: Select from dropdown (Regular Gas, Premium Gas, Diesel, Ethanol, Natural Gas)
   - **Cylinders**: Enter a number between 3-16
   - **Engine Size**: Enter engine size in liters (0.9-8.4)

3. **Calculate Emissions**
   - Click the "Calculate Emission" button
   - Watch the loading animation (processing takes ~1 second)

4. **View Your Results**
   - See your CO₂ emission score displayed on an animated gauge
   - View your category badge (Excellent to Very High)
   - Read the personalized interpretation
   - Get specific recommendations based on your category

5. **Download Professional Report**
   - Click "Download Report" button
   - Receive a beautifully formatted PDF with:
     - Your emission score and gauge
     - Vehicle specifications
     - Detailed analysis
     - Category-specific recommendations
     - Industry benchmarks

6. **Start a New Analysis**
   - Click "Reset" to enter new vehicle parameters

### Using the Eco-Copilot Chatbot

1. **Open the Chatbot**
   - Click the floating chatbot button (bottom-right corner with brain icon on the page)
   - See the Eco-Copilot interface open

2. **Ask Questions**
   - Type any question about emissions, vehicles, or environment
   - Use quick prompts for common questions
   - Get instant, detailed responses

3. **Example Questions to Ask**
   - "How can I reduce my emissions?"
   - "What's the difference between hybrid and electric cars?"
   - "Why do diesel vehicles emit more CO₂?"
   - "What are the health impacts of vehicle emissions?"
   - "How does engine size affect emissions?"
   - "What do the color codes mean?"
   - "How accurate is this prediction?"
   - "What are the best eco-friendly vehicles?"

4. **Get Comprehensive Answers**
   - Chatbot provides knowledge-based responses
   - Information covers technical details, health impacts, costs, and more
   - Markdown formatting for easy reading

##  Environmental Impact

DriveGreen contributes to environmental awareness by:

- **Educating** users about their vehicle's environmental impact
- **Providing** actionable steps to reduce emissions
- **Promoting** sustainable transportation choices
- **Raising awareness** about air quality and climate change
- **Empowering** individuals to make informed vehicle decisions

### Why This Matters
- Transportation accounts for ~29% of greenhouse gas emissions
- Vehicle emissions contribute to air pollution, affecting public health
- Individual choices collectively drive market demand for cleaner vehicles
- Awareness is the first step toward meaningful change

##  Technical Details

### Machine Learning Model
- **Algorithm**: XGBoost
- **Training Data**: EPA and Transport Canada vehicle emission databases
- **Features**: Fuel type, number of cylinders, engine size
- **Target**: CO<sub>2</sub> emissions (g/km)
- **Accuracy**: ~92% on test data
- **Model Storage**: Serialized with joblib as `.pkl` file

### Frontend Architecture
- **Component-Based**: Reusable React components
- **State Management**: React hooks (useState, useEffect, useRef)
- **Performance**: Memoized components to prevent unnecessary re-renders
- **Animations**: Declarative animations with Framer Motion
- **Styling**: Utility-first approach with Tailwind CSS

### Backend Architecture
- **FastAPI**: Clean, standard HTTP endpoints
- **CORS Enabled**: Secure cross-origin requests
- **Error Handling**: Comprehensive try-catch and validation
- **Model Loading**: Efficient one-time model loading on startup
- **Fast Responses**: Average response time < 100ms

##  Contributing

Contributions are welcome! Here's how you can help make DriveGreen even better:

### Areas to Contribute
1. **Report Bugs**: Found an issue? Open a GitHub issue
2. **Suggest Features**: Have ideas? I'd love to hear them
3. **Improve Documentation**: Help make the docs clearer
4. **Add Fuel Options**: Expand support for more fuel options
5. **Enhance ML Model**: Improve prediction accuracy
6. **Translate**: Help make DriveGreen multilingual
7. **Mobile App Development**: Help develop a mobile app for DriveGreen
- More detailed recommendations
- Enhanced visualizations

### Contribution Steps
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/SplendidFeature`)
3. Commit your changes (`git commit -m 'Adding some SplendidFeature'`)
4. Push to the branch (`git push origin feature/SplendidFeature`)
5. Open a Pull Request

##  License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to:
- Use commercially
- Distribute
- Private use

## Author

**Your Name**
- GitHub: [@yaakydd](https://github.com/yaakydd)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: kyddgim17@gmail.com

## Acknowledgments

- **EPA** (Environmental Protection Agency) for emission data standards
- **Transport Canada** for vehicle emission benchmarks
- **Open-source community** for amazing libraries and tools
- **Climate scientists** for their vital research

## Contact

Have questions or suggestions? Feel free to:
- Open an issue on GitHub
- Email: kyddgimd17@gmail.com
---

**Built with 💚 for a greener future**