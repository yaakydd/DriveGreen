from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import json
import time

load_dotenv()

chatbot_router = APIRouter()

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

#Chatbot Analysis Tracking Function
class AnalyticsTracker:
    def __init__(self):
        self.analytics_file = "chatbot_analytics.json"
        self.initialize_analytics()
    
    def initialize_analytics(self):
        """Initialize analytics file if it doesn't exist"""
        if not os.path.exists(self.analytics_file):
            initial_data = {
                "total_requests": 0,
                "ai_responses": 0,
                "fallback_responses": 0,
                "common_questions": {},
                "fallback_triggers": {},
                "response_times": [],
                "user_categories": {},
                "daily_activity": {},
                "conversation_lengths": [],
                "last_updated": datetime.now().isoformat()
            }
            self.save_analytics(initial_data)
    
    def load_analytics(self):
        """Load analytics data from file"""
        try:
            with open(self.analytics_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            self.initialize_analytics()
            return self.load_analytics()
    
    def save_analytics(self, data):
        """Save analytics data to file"""
        with open(self.analytics_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def track_request(self, user_message: str, response_type: str, response_time: float = 0.0, 
                     prediction_data: Optional[Dict[str, Any]] = None):
        """Track a chat request for analytics"""
        try:
            analytics = self.load_analytics()
            
            # Increment counters
            analytics["total_requests"] += 1
            
            if response_type == "ai":
                analytics["ai_responses"] += 1
            else:
                analytics["fallback_responses"] += 1
            
            # Track common questions
            message_lower = user_message.lower().strip()
            if len(message_lower) > 3:  # Ignore very short messages
                analytics["common_questions"][message_lower] = \
                    analytics["common_questions"].get(message_lower, 0) + 1
            
            # Track response time if provided
            if response_time:
                analytics["response_times"].append(response_time)
                # Keep only last 1000 response times
                if len(analytics["response_times"]) > 1000:
                    analytics["response_times"] = analytics["response_times"][-1000:]
            
            # Track user category if prediction data exists
            if prediction_data:
                category = prediction_data.get("category", "Unknown")
                analytics["user_categories"][category] = \
                    analytics["user_categories"].get(category, 0) + 1
            
            # Track daily activity
            today = datetime.now().strftime("%Y-%m-%d")
            analytics["daily_activity"][today] = \
                analytics["daily_activity"].get(today, 0) + 1
            
            # Track conversation length
            analytics["conversation_lengths"].append(len(user_message))
            if len(analytics["conversation_lengths"]) > 1000:
                analytics["conversation_lengths"] = analytics["conversation_lengths"][-1000:]
            
            analytics["last_updated"] = datetime.now().isoformat()
            
            self.save_analytics(analytics)
            
        except Exception as e:
            print(f"Error tracking analytics: {str(e)}")
    
    def get_analytics_summary(self):
        """Get a summary of analytics data"""
        analytics = self.load_analytics()
        
        # Calculate averages
        avg_response_time = 0
        if analytics["response_times"]:
            avg_response_time = sum(analytics["response_times"]) / len(analytics["response_times"])
        
        avg_conversation_length = 0
        if analytics["conversation_lengths"]:
            avg_conversation_length = sum(analytics["conversation_lengths"]) / len(analytics["conversation_lengths"])
        
        # Get top 10 common questions
        common_questions = sorted(
            analytics["common_questions"].items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        # Get fallback reasons from the fallback_triggers
        fallback_triggers = sorted(
            analytics.get("fallback_triggers", {}).items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        return {
            "total_requests": analytics["total_requests"],
            "ai_responses": analytics["ai_responses"],
            "fallback_responses": analytics["fallback_responses"],
            "ai_usage_rate": (
                analytics["ai_responses"] / analytics["total_requests"] * 100 
                if analytics["total_requests"] > 0 else 0
            ),
            "average_response_time_seconds": round(avg_response_time, 3),
            "average_conversation_length": round(avg_conversation_length, 1),
            "top_questions": common_questions,
            "user_categories": analytics["user_categories"],
            "daily_activity_today": analytics["daily_activity"].get(
                datetime.now().strftime("%Y-%m-%d"), 0
            ),
            "fallback_triggers": fallback_triggers
        }

# Initialize analytics tracker
analytics_tracker = AnalyticsTracker()

# Request and Response Models

class ChatRequest(BaseModel):
    message: str
    prediction_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    suggested_questions: Optional[List[str]] = None
    response_type: str = "fallback"  # or "ai"

class AnalyticsResponse(BaseModel):
    summary: Dict[str, Any]

# Suggested Questions Generation Function

def generate_suggested_questions(
    user_message: str, 
    prediction_data: Optional[Dict[str, Any]] = None,
    conversation_history: Optional[List[str]] = None
) -> List[str]:
    """Generate context-aware suggested questions"""
    
    message_lower = user_message.lower()
    questions = []
    
    # Base questions for all users
    base_questions = [
        "How can I reduce my emissions?",
        "What's the environmental impact of my vehicle?",
        "How does my car compare to others?",
        "Are there any government incentives?",
        "Should I consider an electric vehicle?"
    ]
    
    # Context-specific questions based on user's message
    if any(word in message_lower for word in ["result", "prediction", "score", "number"]):
        questions.extend([
            "What does this result mean?",
            "How can I improve my score?",
            "Is this good or bad?",
            "What category am I in?",
            "How accurate is this prediction?"
        ])
    
    if any(word in message_lower for word in ["fuel", "gas", "diesel", "petrol"]):
        questions.extend([
            "Which fuel type is most efficient?",
            "Should I switch to diesel?",
            "How much does fuel type affect emissions?",
            "What are hybrid options?",
            "Is ethanol better for the environment?"
        ])
    
    if any(word in message_lower for word in ["electric", "ev", "hybrid", "tesla"]):
        questions.extend([
            "How much do EVs really help?",
            "What's the total cost of ownership for EVs?",
            "How long do EV batteries last?",
            "Where can I charge an EV?",
            "Are hybrids better than full electric?"
        ])
    
    if any(word in message_lower for word in ["maintenance", "repair", "service", "tire"]):
        questions.extend([
            "What maintenance reduces emissions most?",
            "How often should I service my car?",
            "Does tire pressure really matter?",
            "What's the best motor oil for efficiency?",
            "How much can maintenance reduce emissions?"
        ])
    
    if any(word in message_lower for word in ["drive", "driving", "habit", "technique"]):
        questions.extend([
            "What are the best eco-driving techniques?",
            "How much can I save with better driving?",
            "Does cruise control help?",
            "What speed is most efficient?",
            "How does acceleration affect emissions?"
        ])
    
    if any(word in message_lower for word in ["policy", "law", "regulation", "government"]):
        questions.extend([
            "What are current emission standards?",
            "Are there tax benefits for eco-cars?",
            "What countries have the strictest laws?",
            "How do Ghana's regulations compare?",
            "What future policies are expected?"
        ])
    
    if any(word in message_lower for word in ["compare", "versus", "vs", "better"]):
        questions.extend([
            "How do I compare to average?",
            "What vehicles have the lowest emissions?",
            "SUV vs Sedan emissions?",
            "New vs old car emissions?",
            "Manual vs automatic efficiency?"
        ])
    # If prediction data is available, personalized questions are added
    if prediction_data:
        co2 = prediction_data.get("predicted_co2_emissions", 0)
        category = prediction_data.get("category", "Unknown")
        
        personalized_questions = [
            f"How can I improve from {category} category?",
            f"Is {co2} g/km good for my vehicle type?",
            f"What specific tips for my {category} rated vehicle?",
            f"How much could I save by reducing 20 g/km?",
            f"What vehicles are in the category below mine?"
        ]
        questions.extend(personalized_questions)
    
    # Remove duplicates and limit to 5
    all_questions = list(set(base_questions + questions))
    return all_questions[:5]

# Fallback Response Generation Function

def get_fallback_response(
    user_message: str, 
    prediction_data: Optional[Dict[str, Any]] = None,
    track_trigger: bool = True
) -> str:
    """
    Provides comprehensive fallback responses when AI is unavailable.
    This ensures users always get helpful answers even if the AI service fails.
    """
    message_lower = user_message.lower()
    
    # Track which fallback category was triggered
    fallback_trigger = "default"

    # Prediction Result Explanation
    if prediction_data:
        co2 = prediction_data.get("predicted_co2_emissions", 0)
        category = prediction_data.get("category", "Unknown")
        fuel_type = prediction_data.get("vehicleData", {}).get("fuel_type", "Unknown")
        
        if any(word in message_lower for word in ["result", "prediction", "mean", "explain", "understand"]):
            fallback_trigger = "prediction_explanation"
            return f"""**Your Vehicle Emissions Result:**

Your vehicle emits **{co2} g CO₂/km**, categorized as **{category}**.

**What this means:**
• Average gasoline car: ~180 g CO₂/km
• Efficient hybrid: ~110-120 g CO₂/km
• Your result: {co2} g CO₂/km

{"✅ Great! Your emissions are below average! This means you're already making a positive environmental impact." if co2 < 180 else "⚠️ There's room for improvement. Consider eco-driving habits and regular maintenance to reduce your footprint."}

💡 **Fun fact:** Reducing your emissions by just 20 g CO₂/km over 15,000 km/year saves 300 kg of CO₂ annually!"""
        
        if any(word in message_lower for word in ["improve", "reduce", "lower", "better", "decrease"]):
            fallback_trigger = "improvement_tips"
            return f"""**How to Reduce Your {co2} g CO₂/km Emissions:**

**🚗 Driving Habits (20-30% savings):**
• Accelerate smoothly - avoid jackrabbit starts
• Maintain steady speeds (use cruise control)
• Coast to red lights instead of hard braking
• Remove roof racks when not in use
• Avoid excessive idling (>30 seconds)

**🔧 Vehicle Maintenance (10-15% savings):**
• Keep tires inflated to recommended pressure
• Regular oil changes and tune-ups
• Replace air filters every 12,000 km
• Use the recommended grade of motor oil

**📍 Trip Planning (15-25% savings):**
• Combine errands into one trip
• Avoid rush hour when possible
• Use AC sparingly (opens windows <70 km/h, AC >70 km/h)
• Remove excess weight from trunk

💰 **Potential savings:** Following these tips could reduce your emissions by 40-60 g CO₂/km and save you €200-500 annually in fuel costs!"""

   # Environmental Impact Explanation
    if any(word in message_lower for word in ["impact", "environment", "climate", "global", "world", "planet", "affect"]):
        fallback_trigger = "environmental_impact"
        return """**Global Impact of Vehicle Emissions:**

**🌍 The Big Picture:**
Transportation accounts for approximately **24% of global CO₂ emissions**, with road vehicles responsible for about **75%** of that.

**Key Impacts:**
• **Climate Change:** Vehicles emit ~8 billion tons of CO₂ yearly, contributing to global warming
• **Air Quality:** NOx and particulate matter cause respiratory diseases, affecting 4+ million people annually
• **Urban Heat Islands:** Traffic increases city temperatures by 2-5°C
• **Ocean Acidification:** Absorbed CO₂ harms marine ecosystems

**🔢 Scale of the Problem:**
• 1 billion+ vehicles worldwide
• Average car emits ~4.6 tons of CO₂/year
• If all vehicles improved by 10%, we'd save 800 million tons CO₂/year

**✅ Your Role:**
Every small reduction counts. Collectively, individual actions create massive impact. By reducing your emissions, you're part of the solution!"""
    
    # Policy and Regulation Questions
    if any(word in message_lower for word in ["policy", "policies", "regulation", "government", "law", "legislation", "standard", "implemented"]):
        fallback_trigger = "policy_regulation"
        return """**Vehicle Emission Policies & Regulations:**

**🌍 Global Policies:**

**European Union:**
• Euro 6/7 standards (95 g CO₂/km target for new cars)
• 2035 ban on new ICE vehicle sales
• Emissions trading system (ETS) for transport

**United States:**
• CAFE standards (Corporate Average Fuel Economy)
• Zero Emission Vehicle (ZEV) mandates in California
• Federal tax credits up to $7,500 for EVs

**China:**
• New Energy Vehicle (NEV) mandate
• Dual-credit system for manufacturers
• Target: 40% electric vehicles by 2030

**🇬🇭 Ghana & West Africa:**
• ECOWAS emissions standards adoption
• Vehicle age restrictions (10-15 years in many countries)
• Import regulations favoring cleaner vehicles
• Growing EV incentive programs

**Common Policy Tools:**
• ⛽ Fuel efficiency standards
• 🚗 Emissions testing requirements  
• 💰 Tax incentives for low-emission vehicles
• 🚫 Low Emission Zones (LEZ) in cities
• 📊 Mandatory emissions labeling

**🔮 Future Trends:**
Most countries are targeting net-zero emissions by 2050, with ICE vehicle bans between 2030-2040."""

    # Comparison and Benchmarking Questions
    if any(word in message_lower for word in ["compare", "comparison", "benchmark", "average", "versus", "vs"]):
        fallback_trigger = "comparison_benchmark"
        benchmarks = {
            "🌟 Excellent": "<120 g/km (Hybrids, efficient small cars)",
            "✅ Good": "120-160 g/km (Modern compact cars)",
            "⚠️ Average": "160-200 g/km (Standard sedans)",
            "🔶 High": "200-250 g/km (SUVs, larger vehicles)",
            "🔴 Very High": ">250 g/km (Large SUVs, sports cars)"
        }
        
        result = "**Emission Category Benchmarks:**\n\n"
        for category, value in benchmarks.items():
            result += f"• {category}: {value}\n"
        
        if prediction_data:
            co2 = prediction_data.get("predicted_co2_emissions", 0)
            category = prediction_data.get("category", "Unknown")
            result += f"\n**Your vehicle:** {co2} g CO₂/km ({category})\n"
            
            if co2 < 160:
                result += "\n🎉 Well below average! You're in the top tier for emissions efficiency."
            else:
                result += "\n💡 Consider eco-driving techniques and regular maintenance to improve your category."
        
        return result
    
    # Electric & Hybrid Vehicle Questions
    if any(word in message_lower for word in ["electric", "ev", "hybrid", "plug", "tesla", "battery"]):
        fallback_trigger = "electric_vehicles"
        return """**Electric & Hybrid Vehicles:**

**⚡ Types of EVs:**
• **BEV (Battery Electric):** 100% electric, 0 g CO₂/km tailpipe emissions
• **PHEV (Plug-in Hybrid):** Electric + gas, ~30-50 g CO₂/km
• **HEV (Hybrid):** Self-charging, ~90-120 g CO₂/km

**✅ Benefits:**
• Zero tailpipe emissions (BEV)
• Lower operating costs (~60% cheaper per km)
• Reduced maintenance (fewer moving parts)
• Instant torque & quiet operation
• Government incentives in many regions

**⚠️ Considerations:**
• Higher upfront cost (though decreasing)
• Charging infrastructure (improving rapidly)
• Battery production emissions (offset in 2-3 years of use)
• Range anxiety for BEVs (most now >400 km range)

**🔋 Real-World Impact:**
• Even accounting for electricity generation, EVs emit 50-70% less CO₂ over their lifetime
• As grids get greener, EV emissions drop further (unlike gas cars)

**💰 Total Cost of Ownership:**
EVs typically break even with gas cars after 4-6 years due to fuel and maintenance savings."""
    
    # Eco-Driving Tips Questions
    if any(word in message_lower for word in ["tip", "advice", "eco", "efficient", "save", "fuel"]):
        fallback_trigger = "eco_driving_tips"
        return """**Eco-Driving Tips to Reduce Emissions:**

**🚦 Driving Technique:**
• **Anticipate traffic flow** - Look ahead and coast to stops
• **Smooth acceleration** - Pretend there's an egg under the pedal
• **Maintain steady speeds** - Use cruise control on highways
• **Optimal speed:** 50-80 km/h for best fuel efficiency
• **Avoid aggressive driving** - Can increase fuel use by 40%!

**🔧 Vehicle Care:**
• Check tire pressure monthly (underinflation = +3% fuel use)
• Remove excess weight (extra 50 kg = +2% fuel use)
• Regular maintenance saves 4-10% on fuel
• Use the right motor oil grade

**📍 Smart Planning:**
• Combine trips - A warm engine is 3x more efficient
• Avoid rush hour idling
• Use GPS to find efficient routes
• Park in shade to reduce AC use

**❄️ / ☀️ Climate Control:**
• AC can increase fuel use by 10-20%
• Windows down <70 km/h, AC >70 km/h
• Park in shade when possible

**💡 Pro Tip:** These habits can improve fuel economy by 15-30%, saving both money and emissions!"""
    
    # Vehicle Fuel Types & Emissions Questions
    if any(word in message_lower for word in ["fuel", "diesel", "petrol", "gasoline", "gas", "type"]):
        fallback_trigger = "fuel_types"
        return """**Vehicle Fuel Types & Emissions:**

**⛽ Common Fuel Types:**

**1. Gasoline/Petrol:**
• Average: ~180-200 g CO₂/km
• Pros: Widely available, cleaner than diesel
• Cons: Higher CO₂ than diesel, volatile prices

**2. Diesel:**
• Average: ~160-170 g CO₂/km
• Pros: Better fuel economy (~20% more efficient)
• Cons: Higher NOx and particulate emissions, health concerns

**3. Hybrid:**
• Average: ~90-120 g CO₂/km
• Pros: Best of both worlds, regenerative braking
• Cons: More complex, higher initial cost

**4. Electric (BEV):**
• Tailpipe: 0 g CO₂/km
• Well-to-wheel (including grid): ~50-100 g CO₂/km equivalent
• Pros: Cleanest option, lowest operating costs
• Cons: Range limitations, charging infrastructure

**5. Alternative Fuels:**
• **CNG/LNG:** ~120-140 g CO₂/km
• **Biofuels:** Variable, can be carbon-neutral
• **Hydrogen:** 0 g tailpipe, still developing infrastructure

**🔬 CO₂ per Liter:**
• Gasoline: ~2.3 kg CO₂/liter
• Diesel: ~2.7 kg CO₂/liter"""
    
    # Emission Categories Explanation
    if any(word in message_lower for word in ["category", "categories", "rating", "grade", "level"]):
        fallback_trigger = "category_explanation"
        return """**Emission Categories Explained:**

DriveGreen uses 5 categories to rate vehicle emissions:

**🌟 Excellent (<120 g CO₂/km):**
• Hybrids, plug-in hybrids, efficient small cars
• Examples: Toyota Prius, Honda Insight, VW Golf TDI
• Environmental impact: Minimal

**✅ Good (120-160 g CO₂/km):**
• Modern compact cars, efficient sedans
• Examples: Honda Civic, Mazda3, Toyota Corolla
• Environmental impact: Below average

**⚠️ Average (160-200 g CO₂/km):**
• Standard sedans, crossovers
• Examples: Ford Fusion, Nissan Altima, Honda CR-V
• Environmental impact: Typical for modern vehicles

**🔶 High (200-250 g CO₂/km):**
• SUVs, larger vehicles, performance cars
• Examples: Ford Explorer, Jeep Grand Cherokee
• Environmental impact: Above average

**🔴 Very High (>250 g CO₂/km):**
• Large SUVs, trucks, high-performance sports cars
• Examples: Chevrolet Suburban, Ford F-150, sports cars
• Environmental impact: Significant

**📊 Context:**
The global average is ~180 g CO₂/km. Moving down even one category can save hundreds of kilograms of CO₂ annually!"""
    
    # How DriveGreen Works Explanation
    if any(word in message_lower for word in ["work", "works", "website", "platform", "how", "use"]):
        fallback_trigger = "how_it_works"
        return """**How DriveGreen Works:**

**🎯 Our Mission:**
Help you understand and reduce your vehicle's environmental impact through AI-powered insights.

**📋 Step-by-Step Process:**

**1. Input Vehicle Data**
   • Enter your car's specifications (fuel type, engine size, cylinders, etc.)
   • Our system accepts data for any vehicle type

**2. AI Prediction**
   • Machine learning model analyzes your vehicle data
   • Trained on real-world emissions data from thousands of vehicles
   • Generates accurate CO₂ emission predictions (g/km)

**3. Get Insights**
   • Receive your emission category (Excellent to Very High)
   • Compare against benchmarks and averages
   • Understand your environmental footprint

**4. Take Action**
   • Chat with Eco-Copilot for personalized advice
   • Learn eco-driving techniques
   • Discover ways to reduce emissions
   • Track improvements over time

**💬 Ask Me Anything:**
I'm here to answer questions about vehicle emissions, environmental impact, policies, eco-driving, and more!"""
    
    # Incentives and Benefits Questions
    if any(word in message_lower for word in ["incentive", "benefit", "tax", "rebate", "credit", "subsidy"]):
        fallback_trigger = "incentives_benefits"
        return """**Eco-Vehicle Incentives & Benefits:**

**💰 Financial Incentives:**

**Tax Credits:**
• **USA:** Up to $7,500 for new EVs
• **EU:** Varies by country (€1,000-9,000)
• **China:** Exemption from purchase tax
• **Canada:** Up to $5,000 for EVs

**Purchase Rebates:**
• Many countries offer direct rebates for low-emission vehicles
• Additional state/provincial incentives often available
• Scrappage programs for old vehicles

**Insurance Discounts:**
• 5-15% lower premiums for hybrid/electric vehicles
• Many insurers offer "green vehicle" discounts

**🚗 Operational Benefits:**

**Reduced Fuel Costs:**
• EVs: ~€3-5 per 100 km
• Hybrids: 20-30% fuel savings vs conventional
• Gasoline/Diesel: ~€8-12 per 100 km

**Lower Maintenance:**
• EVs have 60% fewer parts to maintain
• No oil changes, fewer brake replacements
• Reduced long-term costs

**🚦 Access Benefits:**
• **HOV/Carpool Lane Access:** Even with single occupant
• **Low Emission Zones:** Free or reduced-cost entry
• **Preferential Parking:** Special spots, often with charging
• **Toll Reductions:** Some regions offer discounts

**🌍 Ghana-Specific:**
• Duty reductions on imported EVs (under development)
• Potential for future congestion charge exemptions
• Growing charging infrastructure in major cities

**💡 Pro Tip:** Check your local government website for region-specific programs. Incentives change frequently!"""
    
    # Vehicle Size & Emissions Questions
    if any(word in message_lower for word in ["size", "suv", "truck", "sedan", "vehicle type", "bigger", "larger", "smaller"]):
        fallback_trigger = "vehicle_size_impact"
        return """**How Vehicle Size Affects Emissions:**

**📏 Size Matters:**
Larger, heavier vehicles require more energy to move, resulting in higher emissions.

**🚗 Typical Emissions by Size:**

**Small Cars (1,000-1,200 kg):**
• CO₂: 110-140 g/km
• Examples: Toyota Yaris, Honda Fit
• Fuel economy: 5-6 L/100km

**Compact/Mid-Size (1,200-1,500 kg):**
• CO₂: 140-170 g/km
• Examples: Honda Civic, Toyota Corolla
• Fuel economy: 6-7.5 L/100km

**Full-Size Sedans (1,500-1,800 kg):**
• CO₂: 170-210 g/km
• Examples: Toyota Camry, Ford Fusion
• Fuel economy: 7.5-9 L/100km

**SUVs/Crossovers (1,700-2,200 kg):**
• CO₂: 200-250 g/km
• Examples: Honda CR-V, Ford Explorer
• Fuel economy: 8.5-11 L/100km

**Large SUVs/Trucks (2,200+ kg):**
• CO₂: 250-350+ g/km
• Examples: Chevrolet Suburban, Ford F-150
• Fuel economy: 11-15+ L/100km

**⚖️ Weight Impact:**
Every extra 50 kg increases fuel consumption by ~1-2%. That's why removing unnecessary items from your trunk helps!

**🔬 Physics Behind It:**
• Heavier vehicles need more force to accelerate (F = ma)
• Larger frontal area creates more air resistance
• More energy lost to rolling resistance with bigger tires

**💡 Choosing Wisely:**
If you don't need the space, downsizing from an SUV to a sedan can cut emissions by 30-50%!"""
    
    # Emissions Testing & Measurement Questions
    if any(word in message_lower for word in ["test", "testing", "measure", "measurement", "calculate", "calculation"]):
        fallback_trigger = "emissions_testing"
        return """**How Vehicle Emissions Are Measured:**

**🔬 Testing Methods:**

**1. Laboratory Testing (NEDC/WLTP):**
• **NEDC (New European Driving Cycle):** Older standard, being phased out
• **WLTP (Worldwide harmonized Light vehicles Test Procedure):** Current standard
• Vehicles driven on dynamometer (rolling road) under controlled conditions
• More realistic than NEDC but still 10-20% lower than real-world

**2. Real Driving Emissions (RDE):**
• Portable Emissions Measurement Systems (PEMS)
• Actual on-road testing in various conditions
• Most accurate representation of real-world emissions

**3. OBD (On-Board Diagnostics):**
• Built-in vehicle sensors monitor emissions
• Required for modern vehicles
• Helps detect malfunctions that increase emissions

**📊 What's Measured:**
• **CO₂ (Carbon Dioxide):** Primary greenhouse gas
• **NOx (Nitrogen Oxides):** Air pollutant, health hazard
• **CO (Carbon Monoxide):** Toxic gas
• **HC (Hydrocarbons):** Unburned fuel
• **PM (Particulate Matter):** Soot, especially from diesel

**🤖 How DriveGreen Predicts:**
Our AI model uses machine learning trained on thousands of real-world emission tests, correlating vehicle specifications with actual emissions. Accuracy: ~95% for most vehicles.

**💡 Fun Fact:** Real-world emissions can be 15-40% higher than lab tests due to driving style, weather, and road conditions!"""
    
    # Carbon Offsetting Questions
    if any(word in message_lower for word in ["offset", "carbon neutral", "compensate", "neutralize"]):
        fallback_trigger = "carbon_offset"
        return """**Carbon Offsetting for Vehicles:**

**🌳 What is Carbon Offsetting?**
Compensating for your emissions by funding projects that reduce or remove CO₂ from the atmosphere.

**Common Offset Projects:**
• **Reforestation:** Planting trees that absorb CO₂
• **Renewable Energy:** Wind/solar farms replacing fossil fuels
• **Energy Efficiency:** Upgrading buildings, appliances
• **Methane Capture:** Preventing more potent greenhouse gases

**💰 Cost to Offset:**
• Average: €15-30 per ton of CO₂
• Typical car (4.6 tons/year): €70-140 annually
• Calculate: (km driven × g CO₂/km ÷ 1,000,000) × price per ton

**🔍 Where to Offset:**
• **Gold Standard:** www.goldstandard.org
• **Verified Carbon Standard:** verra.org
• **Cool Effect:** cooleffect.org
• **Atmosfair:** atmosfair.de

**⚠️ Important Notes:**
• Offsetting is NOT a substitute for reducing emissions
• Always prioritize reducing first, offset what remains
• Ensure projects are certified and additional
• Beware of greenwashing - verify claims

**🌍 Better Alternative:**
Reducing your emissions by 50 g CO₂/km has more immediate impact than offsetting. Focus on eco-driving and vehicle choice first!"""
    
    # Default Greeting and Overview
    fallback_trigger = "default_greeting"
    return """**I'm Eco-Copilot, your vehicle emissions assistant!** 🌱

I can help you with:

**📊 Emissions & Results:**
• Understanding your CO₂ prediction
• Comparing against benchmarks
• Emission categories explained

**🌍 Environmental Impact:**
• Global climate effects of vehicles
• Local air quality concerns
• Your carbon footprint

**📜 Policies & Regulations:**
• Emission standards worldwide
• Government incentives & rebates
• Future legislation trends

**🚗 Vehicle Information:**
• Fuel type comparisons
• How size affects emissions
• Electric vs hybrid vs gas

**💡 Practical Tips:**
• Eco-driving techniques
• Maintenance for efficiency
• Trip planning strategies

**💬 Just ask naturally!** Examples:
• "How can I reduce my emissions?"
• "What's the impact of my car?"
• "Are there incentives for buying an EV?"
• "Why do SUVs emit more CO₂?"

I'm here to help you understand and reduce your environmental impact! 🌍"""


# Prompt Tuning / Construction Function

def build_context_prompt(
    user_message: str,
    prediction_data: Optional[Dict[str, Any]] = None
) -> str:
    """Build the complete prompt for the AI model"""
    
    system_prompt = """You are Eco-Copilot, a knowledgeable and friendly vehicle emissions expert.

YOUR EXPERTISE:
- Vehicle emissions and fuel efficiency
- Environmental impact of transportation
- Eco-driving techniques
- Government policies and incentives
- Electric vehicles and alternative fuels
- Climate change and air quality

RESPONSE STYLE:
- Conversational yet professional
- Use concrete examples and numbers
- 2-4 paragraphs maximum (keep it digestible)
- Use bullet points sparingly
- Encourage sustainable choices
- Metric units (g CO₂/km)

TONE: Like a knowledgeable friend who's passionate about sustainability

DON'T:
- Mention you're an AI
- Be preachy or judgmental
- Invent statistics
- Give overly technical explanations"""

    reference_data = """
KEY BENCHMARKS:
- Average gas car: ~180 g CO₂/km
- Efficient hybrid: ~110-120 g CO₂/km
- Diesel average: ~160-170 g CO₂/km
- EV tailpipe: 0 g CO₂/km
- Transportation: 24% of global CO₂ emissions

EMISSION CATEGORIES:
• Excellent: <120 g/km
• Good: 120-160 g/km
• Average: 160-200 g/km
• High: 200-250 g/km
• Very High: >250 g/km
"""

    vehicle_context = ""
    if prediction_data:
        vehicle_context = f"""
USER'S VEHICLE:
- CO₂: {prediction_data.get("predicted_co2_emissions", "N/A")} g/km
- Category: {prediction_data.get("category", "N/A")}
- Fuel: {prediction_data.get("vehicleData", {}).get("fuel_type", "N/A")}
- Engine: {prediction_data.get("vehicleData", {}).get("engine_size", "N/A")} L
- Cylinders: {prediction_data.get("vehicleData", {}).get("cylinders", "N/A")}

When user refers to "my car/vehicle/result", use this data.
"""

    return f"""{system_prompt}

{reference_data}
{vehicle_context}

USER: {user_message}

RESPONSE:"""

#Chatbot endpoint with Error Handling and Fallbacks

@chatbot_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint with robust error handling and fallback responses
    """
    start_time = time.time()
    
    print(f"\n CHAT REQUEST START ")
    print(f"Message: {request.message}")
    print(f"Has prediction data: {bool(request.prediction_data)}")
    print(f"API Key present: {bool(HUGGINGFACE_API_KEY)}")
    if HUGGINGFACE_API_KEY:
        print(f"API Key first 10 chars: {HUGGINGFACE_API_KEY[:10]}...")
    
    # Generate suggested questions first
    suggested_questions = generate_suggested_questions(
        request.message, 
        request.prediction_data
    )
    
    # Try AI first, fallback on failure
    ai_response = None
    response_type = "fallback"
    
    if HUGGINGFACE_API_KEY:
        print("Attempting AI response...")
        ai_response = try_ai_response(request.message, request.prediction_data)
        print(f"AI response result: {'Success' if ai_response else 'Failed'}")
    
    if ai_response:
        response_type = "ai"
        response_text = ai_response
        print("Using AI-generated response")
    else:
        print("Using fallback response")
        response_text = get_fallback_response(
            request.message, 
            request.prediction_data,
            track_trigger=True
        )
    
    # Calculate response time
    response_time = time.time() - start_time
    
    # Track analytics
    analytics_tracker.track_request(
        user_message=request.message,
        response_type=response_type,
        response_time=response_time,
        prediction_data=request.prediction_data
    )
    
    print(f"Chat response generated in {response_time:.2f}s (type: {response_type})")
    print(f" CHAT REQUEST END \n")
    
    return ChatResponse(
        response=response_text,
        suggested_questions=suggested_questions,
        response_type=response_type
    )


def try_ai_response(user_message: str, prediction_data: Optional[Dict[str, Any]] = None) -> Optional[str]:
    """Try to get AI response, return None if fails"""
    if not HUGGINGFACE_API_KEY:
        print("No HUGGINGFACE_API_KEY found")
        return None

    prompt = build_context_prompt(user_message, prediction_data)
    
    # Using a better model - Mistral 7B is much better for conversation
    API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
    
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 400,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True,
            "return_full_text": False
        },
        "options": {
            "wait_for_model": True,
            "use_cache": False
        }
    }

    try:
        print(f"Attempting AI response for: {user_message[:50]}...")
        print(f"API URL: {API_URL}")
        
        response = requests.post(
            API_URL,
            headers=headers,
            json=payload,
            timeout=30  # Increased timeout
        )

        print(f"Response status: {response.status_code}")

        if response.status_code != 200:
            print(f"API error {response.status_code} - Response: {response.text[:200]}")
            return None

        result = response.json()
        print(f"Response JSON type: {type(result)}")

        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get("generated_text", "").strip()
            print(f"Generated text length: {len(generated_text)}")
        elif isinstance(result, dict):
            generated_text = result.get("generated_text", "").strip()
            print(f"Generated text length: {len(generated_text)}")
        else:
            print(f"Unexpected response format")
            return None

        if not generated_text:
            print("AI response empty string")
            return None
            
        if len(generated_text) < 20:
            print(f"AI response too short: {len(generated_text)} chars")
            return None

        print(f"AI response successful: {len(generated_text)} characters")
        return generated_text

    except Exception as e:
        print(f"AI response error: {str(e)}")
        return None


#Analytics endpoint

@chatbot_router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """Get chatbot analytics summary"""
    try:
        summary = analytics_tracker.get_analytics_summary()
        print("Analytics data retrieved successfully")
        return AnalyticsResponse(summary=summary)
    except Exception as e:
        print(f"Error getting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")


@chatbot_router.get("/analytics/reset")
async def reset_analytics():
    """Reset analytics data (for testing purposes)"""
    try:
        analytics_tracker.initialize_analytics()
        print("Analytics data reset successfully")
        return {"message": "Analytics data reset successfully"}
    except Exception as e:
        print(f"Error resetting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reset analytics")


# Health Check endpoint

@chatbot_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "analytics_enabled": True,
        "ai_enabled": bool(HUGGINGFACE_API_KEY),
        "fallback_topics": 14  # Number of fallback topics covered
    }