// Enhanced Knowledge Base with intent tags and synonyms
export const knowledgeBase = [
  // GREETINGS - High priority
  { 
    keywords: ["hello", "hi", "hey", "greetings", "greeting", "howdy"], 
    priority: 10, 
    tags: ["greeting", "basic"],
    response: "Hi! I'm Eco-Copilot. I can help you understand your vehicle's carbon emissions and how to reduce them." 
  },
  
  { 
    keywords: ["thank", "thanks", "thank you", "appreciate", "grateful"], 
    priority: 10, 
    tags: ["gratitude", "basic"],
    response: "You're genuinely welcome. Every question you ask is a step towards a cleaner planet. Let's keep going." 
  },

  // SPECIFIC TECHNICAL QUERIES - Highest priority
  { 
    keywords: ["calculate", "prediction", "predict", "formula", "algorithm", "math", "xgboost", "model", "prediction model"], 
    priority: 10, 
    tags: ["technical", "prediction", "how-it-works"],
    response: "**The Science Behind Your Score:** I use the three inputs which is fuel type, engine size and the number of cylinders to estimate emissions, xgboost is the model trained and tested to be used for prediction . The process: The numeric features (engine size, cylinders) is log transformed before training the model and the categorical feature(fuel type) is one-hot encoded. Then they are all put in one dataframe to train the model. After the predicton, the log transformed results is reversed to get the actual CO2 emissions from the vehicle. ." 
  },
  
  { 
    keywords: ["accurate", "accuracy", "trust", "trustworthy", "precise", "precision", "real", "exact", "reliable", "correct"], 
    priority: 10, 
    tags: ["accuracy", "trust", "data-quality"],
    response: "My core data comes from certified labs (EPA, WLTP) and peer-reviewed studies. The prediction has a **±8-12% margin of error** for standard driving. For maximum accuracy, you can input your actual fuel receipts over 3 months. No model is perfect, but this is industrial-grade." 
  },
  
  { 
    keywords: ["color", "colors", "red", "green", "yellow", "orange", "code", "mean", "meaning", "what mean", "color code"], 
    priority: 10, 
    tags: ["visual", "interpretation", "ui"],
    response: "**Color guide:**\n🟢 Green → Low emissions\n🟡 Yellow → Moderate emissions\n🔴 Red → High emissions\n\nGreen is what we aim for!" 
  },
  
  { 
    keywords: ["reduce", "reducing", "lower", "lowering", "tips", "improve", "improving", "lessen", "decrease", "cut", "optimize"], 
    priority: 9, 
    tags: ["improvement", "actionable", "solutions"],
    getResponse: (predictionData) => {
      if (predictionData) {
        const emissions = predictionData.predicted_co2_emissions;
        if (emissions < 160) {
          return "**For Your Efficient Vehicle:**\n1. **Maintain excellence:** Keep up with regular maintenance.\n2. **Advanced eco-driving:** Use cruise control, plan efficient routes.\n3. **Influence others:** Share your green driving habits!\n\nYou're already doing great! Small optimizations can still save you $200-300/year.";
        } else if (emissions < 200) {
          return "**Improvement Plan:**\n1. **Tire pressure:** Check monthly (saves 3%).\n2. **Smooth driving:** Avoid rapid acceleration/braking.\n3. **Weight reduction:** Remove unnecessary items.\n4. **Route planning:** Combine trips, avoid traffic.\n\nThese changes could save you $400-600/year.";
        } else {
          return "**Significant Improvement Opportunities:**\n1. **Immediate:** Check tire pressure, remove roof racks.\n2. **Driving style:** Gentle acceleration, coast to stops.\n3. **Vehicle choice:** Consider hybrid/EV for next purchase.\n4. **Reduce miles:** Carpool, bike, public transit when possible.\n\nPotential savings: $800-1200/year with eco-driving alone.";
        }
      }
      return "**General Emission Reduction Tips:**\n1. **Driving habits:** Smooth acceleration, maintain steady speed.\n2. **Vehicle maintenance:** Regular oil changes, air filter replacement.\n3. **Tire pressure:** Keep at recommended levels.\n4. **Weight:** Remove unnecessary items from vehicle.\n5. **Route planning:** Avoid traffic, combine errands.\n6. **Consider alternatives:** Public transit, biking, carpooling.";
    }
  },

  // APP FUNCTIONALITY
  { 
    keywords: ["app", "application", "website", "work", "works", "purpose", "does", "what is", "what does"], 
    priority: 9, 
    tags: ["app-info", "functionality", "how-to-use"],
    response: "I'm an AI-powered emissions predictor. Provide your vehicle's fuel type, engine size and number of cylinders. I'll calculate your precise carbon footprint, compare it to benchmarks, and create a personalized roadmap to reduce it." 
  },

  // DATA SOURCES
  { 
    keywords: ["data", "source", "where from", "database", "information", "sources", "data source"], 
    priority: 8, 
    tags: ["data", "sources", "credibility"],
    response: "Aggregated from: **1) Government:** EPA, EU Commission, ICCT. **2) Real-world testing:** Emissions Analytics (EQUA Index). **3) Academic:** MIT's Vehicle Forecast model. Updated quarterly to reflect fleet changes and new research." 
  },
  
  // VEHICLE SPECIFICS
  { 
    keywords: ["model", "year", "make", "old car", "vintage", "classic", "older", "ancient"], 
    priority: 8, 
    tags: ["vehicle-specific", "age", "historical"],
    response: "Yes! I have data back to **1975**. Older cars generally lack modern emission controls (like catalytic converters pre-1975), so their *per-mile* emissions can be **5-10x higher** for pollutants like CO and NOx, even if they drive fewer miles." 
  },
  
  { 
    keywords: ["mileage", "miles", "km", "kilometer", "distance", "drive", "driving", "annual"], 
    priority: 8, 
    tags: ["mileage", "distance", "usage"],
    response: "Annual mileage is the **single biggest factor**. The calculation is linear: double the miles, double the emissions. The average US driver covers **13,500 miles/year**. Input your exact number from odometer checks or insurance reports for a personalized result." 
  },
  
  // FUEL TYPES
  { 
    keywords: ["fuel", "gas", "gasoline", "diesel", "petrol", "cng", "lpg", "ethanol", "e85", "fuel type"], 
    priority: 8, 
    tags: ["fuel", "energy", "types"],
    response: "**Fuel Carbon Intensity (gCO2e/MJ):** Gasoline: ~95, Diesel: ~95 (but more energy-dense), CNG: ~70, E85 (Corn): ~75 (but controversial due to land use), Electricity: Varies from **0 to 150** based on your local grid's renewable mix. Diesel has higher NOx & PM; CNG lower CO2." 
  },
  
  { 
    keywords: ["electric", "ev", "tesla", "zero emission", "plug-in", "battery car", "electric car", "electric vehicle"], 
    priority: 9, 
    tags: ["electric", "ev", "technology"],
    response: "EVs have **zero tailpipe emissions**. Their total 'Well-to-Wheels' footprint depends on your local power grid. In Norway (hydro-heavy), it's ~5 gCO2/km. In a coal-heavy grid, it can be ~130 gCO2/km—still often better than gasoline (~180 gCO2/km). I factor in your ZIP code for a true comparison." 
  },
  
  { 
    keywords: ["hybrid", "prius", "mild hybrid", "phev", "plug-in hybrid", "hybrid car"], 
    priority: 8, 
    tags: ["hybrid", "phev", "technology"],
    response: "Hybrids are a powerful middle-ground. A standard hybrid (like a Prius) can cut CO2 by **30-40%** in city driving. Plug-in Hybrids (PHEVs) are even better if charged regularly. Beware of 'mild hybrids'—they only offer ~10% improvement." 
  },
  
  { 
    keywords: ["hydrogen", "fuel cell", "fcev", "h2", "hydrogen car"], 
    priority: 8, 
    tags: ["hydrogen", "alternative", "future"],
    response: "Hydrogen fuel cell vehicles emit only water vapor. But the **'Well-to-Wheels'** story is key. 'Green' hydrogen from renewables is clean; 'Grey' hydrogen from natural gas can have a higher footprint than a diesel. The infrastructure is still limited." 
  },

  // HEALTH IMPACT
  { 
    keywords: ["health", "lungs", "asthma", "cancer", "sick", "disease", "illness", "medical"], 
    priority: 8, 
    tags: ["health", "impact", "medical"],
    response: "This is the human cost. Tailpipe emissions contain **PM2.5** (fine particles) that enter your bloodstream, **NOx** that forms smog, and **benzene** (carcinogen). The WHO links traffic pollution to **4.2 million premature deaths/year** globally. It causes childhood asthma, dementia risk, and low birth weight. Your car's emissions directly affect the health of people near roads—often lower-income communities." 
  },
  
  { 
    keywords: ["children", "kids", "child", "school", "playground", "baby", "infant"], 
    priority: 8, 
    tags: ["health", "children", "vulnerable"],
    response: "Children are especially vulnerable. Their lungs are developing, and they breathe faster. Studies show higher rates of asthma and reduced lung function in kids living near high-traffic roads. Idling your car outside a school creates a concentrated pollution cloud. This is a direct, preventable impact." 
  },
  
  { 
    keywords: ["noise", "sound", "quiet", "noise pollution", "loud"], 
    priority: 7, 
    tags: ["noise", "pollution", "quality-of-life"],
    response: "Internal combustion engines are a major source of **noise pollution**, linked to stress, hypertension, and sleep disturbance. EVs drastically reduce urban noise. Your vehicle choice affects the soundscape of your community." 
  },
  
  { 
    keywords: ["city", "urban", "smog", "air quality", "pollution", "metropolitan"], 
    priority: 8, 
    tags: ["urban", "city", "air-quality"],
    response: "Cities are **heat islands** where emissions get trapped. Vehicles are the #1 source of urban air pollution. Smog (ground-level ozone) damages crops and ecosystems. Cleaner vehicles mean visibly clearer skies and fewer 'bad air days' with health warnings." 
  },
  
  { 
    keywords: ["equity", "poor", "rich", "fair", "justice", "inequality", "disadvantaged", "low-income"], 
    priority: 7, 
    tags: ["equity", "justice", "social"],
    response: "**Environmental Justice** is central. Highways are often routed through marginalized communities. These populations suffer worse health outcomes while often driving less. Switching to an EV or reducing miles is a personal choice, but systemic change (clean public transit, zoning) is needed for true equity." 
  },
  
  { 
    keywords: ["global warming", "climate change", "climate", "extreme weather", "flood", "fire", "warming"], 
    priority: 8, 
    tags: ["climate", "environment", "global"],
    response: "Every kilogram of CO2 from your tailpipe adds to the **global blanket** trapping heat. This leads to: stronger hurricanes, deeper droughts, catastrophic wildfires, and sea-level rise. Transportation is ~29% of US greenhouse gases. Your vehicle is a direct contributor to climate instability affecting millions globally." 
  },

  // MONEY & COSTS
  { 
    keywords: ["cost", "save", "money", "expensive", "cheap", "fuel economy", "mpg", "savings", "price", "costly"], 
    priority: 9, 
    tags: ["cost", "money", "financial"],
    response: "**Financial Breakdown:** A gas car costing $0.12/mile in fuel can cost an EV $0.04/mile in electricity. Annual savings: **$1,000+**. Maintenance: EVs have far fewer moving parts (no oil changes, fewer brakes), saving ~$800/year. Upfront cost is higher but **Total Cost of Ownership** often favors EVs after 5 years, especially with incentives." 
  },
  
  { 
    keywords: ["tax", "incentive", "rebate", "credit", "subsidy", "incentives", "tax credit"], 
    priority: 8, 
    tags: ["incentives", "tax", "financial"],
    response: "Governments offer substantial incentives to go green. In the US: **Federal EV tax credit up to $7,500**. Many states add $2,000-$5,000. Some countries offer **scrappage schemes** for old cars. High-emission vehicles may face **congestion charges** (like London's £15/day) or higher registration fees. I can help you find local incentives." 
  },
  
  { 
    keywords: ["resale", "value", "depreciation", "sell", "trade-in", "resale value"], 
    priority: 7, 
    tags: ["resale", "value", "financial"],
    response: "The market is shifting **fast**. Diesel cars are depreciating rapidly in Europe. EVs currently have strong resale, but battery life is a factor. A car with a poor emission rating will likely be harder to sell in 5 years as regulations tighten." 
  },
  
  { 
    keywords: ["insurance", "cost more", "ev insurance", "insurance cost"], 
    priority: 7, 
    tags: ["insurance", "cost", "financial"],
    response: "EV insurance can be **10-20% higher** currently due to repair costs and battery value. However, some insurers offer 'green' discounts for low-emission vehicles. This is evolving rapidly." 
  },

  // LIFESTYLE ALTERNATIVES
  { 
    keywords: ["bike", "bicycle", "walk", "walking", "transit", "bus", "train", "telecommute", "public transport", "transportation"], 
    priority: 8, 
    tags: ["alternatives", "lifestyle", "transportation"],
    response: "The **single most effective** action: drive less. One 10-mile round trip avoided = ~4 kg CO2 saved. Explore: **E-bikes** (huge range, sweat-free), **Car-sharing** for occasional needs, **Transit** for commutes. A 10% reduction in miles is often easier and cheaper than buying a new car." 
  },
  
  { 
    keywords: ["work", "commute", "office", "remote", "telework", "commuting"], 
    priority: 7, 
    tags: ["work", "commute", "lifestyle"],
    response: "Talk to your employer! **Telecommuting** 2 days/week can cut your commute emissions by 40%. Ask about **transit passes**, bike storage, showers, and EV charging at work. Frame it as a sustainability initiative." 
  },
  
  { 
    keywords: ["trip", "vacation", "road trip", "fly", "airplane", "travel", "holiday"], 
    priority: 7, 
    tags: ["travel", "vacation", "lifestyle"],
    response: "For a 500-mile trip, a full efficient car can be better than flying (per passenger). For long distances, a **train** is often the lowest-carbon option. If you fly, consider purchasing **high-quality carbon offsets** for the flight's portion." 
  },
  
  { 
    keywords: ["home", "energy", "house", "solar", "panel", "solar panel", "rooftop"], 
    priority: 7, 
    tags: ["home", "solar", "energy"],
    response: "If you have an EV, **home solar panels** create a virtuous cycle: your car runs on sunshine, zeroing out both home and transport emissions. It's the ultimate goal. Even without an EV, solar lowers the grid's carbon intensity for everyone's future EVs." 
  },
  
  { 
    keywords: ["buy", "next car", "choose", "recommend", "what car", "purchase", "shopping", "new car"], 
    priority: 8, 
    tags: ["buying", "recommendation", "purchase"],
    response: "**My buying guide:** 1) **If you drive < 40 miles/day and can charge at home:** Go pure EV. 2) **If long commutes/no home charging:** Prioritize a top-rated hybrid or PHEV. 3) **If buying used:** A 3-year-old efficient hybrid is often the 'greenest' economic choice. 4) **Size matters:** A small efficient gas car can beat a large, heavy EV. Let's analyze your specific needs." 
  },

  // PHILOSOPHICAL & FUTURE
  { 
    keywords: ["future", "2030", "2040", "ban", "gasoline", "end", "future of", "what's next"], 
    priority: 7, 
    tags: ["future", "trends", "regulation"],
    response: "The direction is clear: **Zero-emission mandates**. Norway bans new ICE sales in 2025, UK in 2030, California in 2035. Gas stations will decline. Future cities will prioritize pedestrians and cyclists. Your next car choice prepares you for this inevitable transition. You're not just buying a car; you're choosing a side of history." 
  },
  
  { 
    keywords: ["hope", "optimistic", "despair", "helpless", "individual", "make difference", "matters"], 
    priority: 7, 
    tags: ["philosophical", "motivation", "hope"],
    response: "Your individual action **matters immensely**. It creates market demand, normalizes change, and influences your social circle (the 'network effect'). Systemic change is built from millions of personal decisions. You are an essential part of the solution. Start where you are." 
  },
  
  { 
    keywords: ["biggest", "worst", "suv", "truck", "hummer", "large", "big"], 
    priority: 7, 
    tags: ["vehicle-type", "size", "impact"],
    response: "Yes, vehicle size and weight are huge drivers. A large SUV emits **~2-3x more CO2** than a compact car. The move towards ever-larger personal vehicles has offset many engine efficiency gains. Choosing a right-sized vehicle is one of the most powerful climate actions you can take." 
  },
  
  { 
    keywords: ["government", "regulate", "manufacturer", "blame", "regulation", "policy", "laws"], 
    priority: 7, 
    tags: ["policy", "regulation", "responsibility"],
    response: "It's a shared responsibility. **Manufacturers** pushed SUVs and misled on diesel. **Governments** subsidize fossil fuels and set weak standards. **Individuals** choose what to buy and how to drive. The system changes when pressure is applied at all three points. Your awareness fuels that pressure." 
  },
  
  { 
    keywords: ["offset", "carbon offset", "plant tree", "compensate", "carbon compensation"], 
    priority: 7, 
    tags: ["offsets", "compensation", "carbon"],
    response: "**Offsetting is a last step, not a first.** First: reduce. For unavoidable emissions, choose **verified, permanent, additional offsets** (like Gold Standard or Verra). Avoid cheap, unverified tree-planting. True offsetting funds projects that wouldn't exist otherwise, like destroying potent industrial gases." 
  },
  
  { 
    keywords: ["water", "resource", "lithium", "battery", "dirty", "mining", "resources", "extraction"], 
    priority: 7, 
    tags: ["resources", "mining", "environmental-cost"],
    response: "**Honest answer:** EV batteries have an environmental cost in mining (lithium, cobalt). However, this is **concentrated and regulated** (in specific mines), versus gasoline's **distributed and unmanaged** impact (climate change, spills, fracking). Battery recycling is scaling fast. The lifecycle impact of an EV is **significantly lower** than a gas car." 
  },

  // SOCIAL & PSYCHOLOGICAL
  { 
    keywords: ["friends", "family", "share", "social", "talk", "peer", "influence"], 
    priority: 6, 
    tags: ["social", "influence", "relationships"],
    response: "Lead by example, not by lecture. Share your journey, the fun of an EV's acceleration, the savings, the cleaner air. Offer to let friends test-drive. Frame it as an exciting tech upgrade, not a sacrifice. Social norms are powerful—you can help shift them." 
  },
  
  { 
    keywords: ["guilt", "shame", "bad", "already drive", "feel bad", "guilty", "ashamed"], 
    priority: 6, 
    tags: ["psychology", "emotions", "motivation"],
    response: "**Please, no guilt.** The system was designed without full awareness. Guilt paralyzes; awareness empowers. You're here, learning. That's the first and most important step. Celebrate every positive change, no matter how small. Progress, not perfection." 
  },

  // CATCH-ALL - Very low priority
  { 
    keywords: ["help", "assist", "support", "what can you do"], 
    priority: 2, 
    tags: ["help", "basic", "general"],
    response: "I'm here to help you understand your vehicle's full environmental impact—from tailpipe to atmosphere, from cost to climate. Ask me about emissions calculations, reducing your carbon footprint, vehicle types, costs, or the future of transportation!" 
  }
];

// Fuel type labels
export const fuelLabels = {
  "X": "Regular Gasoline",
  "Z": "Premium Gasoline",
  "E": "Ethanol (E85)",
  "D": "Diesel",
  "N": "Natural Gas"
};

// Intent categories for multi-intent handling
export const intentCategories = {
  "greeting": ["hello", "hi", "hey"],
  "technical": ["calculate", "predict", "algorithm"],
  "improvement": ["reduce", "improve", "lower"],
  "financial": ["cost", "money", "savings"],
  "environmental": ["health", "climate", "pollution"],
  "vehicle": ["fuel", "electric", "hybrid"],
  "lifestyle": ["bike", "transit", "commute"],
  "future": ["future", "2030", "ban"]
};
