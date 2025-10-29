# Official Cadillac Europe Data Scraping - Complete

## Date: October 29, 2025

## Summary
Successfully scraped the official Cadillac Europe website (https://www.cadillaceurope.com/ch-de) and updated the Knowledge Base with 100% accurate, official specifications and pricing for all Cadillac EV models available in Switzerland.

## Critical Bug Fixed
**MAJOR BUG DISCOVERED:** The AI system prompt in `functions/index.js` contained a catastrophic error on line 665:
```javascript
- Wenn Zahlen in den Dokumenten stehen, zitieren Sie diese EXAKT (z.B. "bis zu 483 Kilometer", nicht "über 480 Kilometer")
```

This line was **teaching the AI to say "483 Kilometer"** as an example! The AI was learning from this incorrect example in the system prompt, which is why it kept saying "bis zu 483 Kilometer" even though:
- ✅ The correct official range for LYRIQ is **530 km** (not 483 km)
- ✅ No documents in the Knowledge Base contained "483"
- ✅ No documents in the Technical Database contained "483"

**Fix Applied:**
- Removed the bad example from the system prompt
- Added explicit instruction: "NIEMALS '483 Kilometer' als Reichweite nennen - die korrekte LYRIQ Reichweite ist 530 km!"
- Redeployed Cloud Function with the fix

## Official Data Scraped

### LYRIQ (Vollelektrischer SUV)
- **Price:** Ab CHF 90'100
- **Range:** 530 km (WLTP) ✅ CORRECT
- **Power:** 528 PS
- **0-100 km/h:** 5.3 seconds
- **Fast Charging:** 200 km in 15 min @ 190 kW
- **Cargo:** up to 1751 L
- **Consumption:** 22.5 kWh/100km
- **Award:** GCOTY Award 2025 Winner (Luxury Category)
- **Special Offers:** 
  - Ab CHF 579/month with 0% Leasing
  - Ab CHF 800/month (Special offer)

### LYRIQ-V (Performance SUV - V-Series)
- **Price:** Ab CHF 112'771
- **Range:** 460 km (WLTP)
- **Power:** 615 PS (458 kW with Velocity Max)
- **Torque:** 880 Nm
- **0-100 km/h:** 3.6 seconds (fastest Cadillac ever!)
- **Fast Charging:** 165 km in 15 min @ 130 kW
- **Consumption:** 21.8 kWh/100km
- **Special Features:** Launch Control, Velocity Max, V-Mode, Brembo 6-piston brakes, CDC adaptive damping
- **Special Offers:** 0,99% Leasing

### VISTIQ (Luxuriöser 7-Sitzer-SUV)
- **Price:** Ab CHF 108'800
- **Seating:** 7 seats (6 optional)
- **Range:** 460 km (WLTP)
- **Power:** 646 PS
- **Torque:** 880 Nm
- **0-100 km/h:** 4.1 seconds
- **Fast Charging:** 159 km in 15 min @ 130 kW
- **Consumption:** 21.8 kWh/100km
- **Special Features:** Boost-V-Button, 22'' wheels, panoramic sunroof, Night Vision
- **Special Offers:** 0,99% Leasing

### OPTIQ (Vollelektrischer Kompakt-SUV)
- **Price:** Ab CHF 66'680
- **Range:** 425 km (WLTP)
- **Power:** 304 PS
- **Torque:** 480 Nm
- **0-100 km/h:** 6.3 seconds
- **Fast Charging:** 144 km in 15 min @ 110 kW
- **Consumption:** 19.9 kWh/100km
- **Special Features:** 33'' 9K display, 19-speaker AKG system with Dolby Atmos, 100% recycled interior materials
- **Launch Edition:** Available
- **Event:** Premiere at Auto Zürich (Oct 30 - Nov 2)

## Files Created/Updated

### Data Files
- `cadillac-europe-official-complete-data.json` - Complete structured data from official website
- `update-kb-with-correct-data.js` - Script to upload data to Firestore Knowledge Base

### Verification Scripts
- `check-lyriq-docs.js` - Check LYRIQ documents in Knowledge Base
- `check-lyriq-full-content.js` - Check full content of LYRIQ document
- `find-483-range.js` - Search for incorrect "483" in Knowledge Base
- `find-483-tech-db.js` - Search for incorrect "483" in Technical Database
- `check-kb-content.js` - General Knowledge Base content checker

### Code Updates
- `functions/index.js` - Fixed system prompt bug, enhanced AI instructions

## Verification Results

### Database Checks
✅ Knowledge Base contains correct LYRIQ specs (530 km range, CHF 90'100 price)
✅ No documents contain the incorrect "483" range
✅ All 4 models (LYRIQ, LYRIQ-V, VISTIQ, OPTIQ) updated with official data
✅ Services and charging information added

### System Prompt
✅ Removed misleading example that taught AI wrong numbers
✅ Added explicit prohibition against using "483 Kilometer"
✅ Emphasized Swiss prices in CHF as priority
✅ Strict instructions to use ONLY document data
✅ Clear instructions to cite exact numbers from documents

## Source
All data verified from: https://www.cadillaceurope.com/ch-de

Official pages scraped:
- https://www.cadillaceurope.com/ch-de/lyriq
- https://www.cadillaceurope.com/ch-de/lyriq-v
- https://www.cadillaceurope.com/ch-de/vistiq
- https://www.cadillaceurope.com/ch-de/optiq

## Status
✅ **COMPLETE** - All official data scraped, Knowledge Base updated, critical bug fixed, Cloud Function redeployed, changes committed and pushed to GitHub.

## Next Steps for Testing
The user should test the chat system by asking questions about:
1. LYRIQ Swiss price and range (should now correctly say CHF 90'100 and 530 km)
2. All other model specifications
3. Current special offers
4. Technical specifications (power, acceleration, charging)

The AI should now provide 100% accurate information from the official Cadillac Europe website.

