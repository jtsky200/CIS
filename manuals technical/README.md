# Vehicle Manuals Directory

## How to Add PDF Manuals

Place your vehicle PDF manuals in this directory using the following naming convention:

### Naming Convention

The system automatically detects vehicle type and manual type from the filename:

#### Main Cadillac Electric Vehicles (priority detection):
- **LYRIQ** - Files containing "lyriq" in filename
- **VISTIQ** - Files containing "vistiq" in filename
- **OPTIQ** - Files containing "optiq" in filename

#### Additional Supported Vehicles:
- **ESCALADE** - Files containing "escalade" in filename
- **CELESTIQ** - Files containing "celestiq" in filename
- **CADILLAC** - General Cadillac files containing "cadillac"

#### Manual Types (detected automatically):
- **USER_MANUAL** - Files containing "user" or "owner"
- **SERVICE_MANUAL** - Files containing "service" or "maintenance" 
- **TROUBLESHOOTING** - Files containing "troubleshoot"
- **QUICK_START** - Files containing "quick" or "start"
- **WARRANTY** - Files containing "warranty"
- **SAFETY** - Files containing "safety"

### Example Filenames:
- `Cadillac_LYRIQ_User_Manual_2024.pdf` → Vehicle: LYRIQ, Type: USER_MANUAL
- `VISTIQ_Service_Manual.pdf` → Vehicle: VISTIQ, Type: SERVICE_MANUAL
- `OPTIQ_Troubleshooting_Guide.pdf` → Vehicle: OPTIQ, Type: TROUBLESHOOTING
- `LYRIQ_Quick_Start_Guide.pdf` → Vehicle: LYRIQ, Type: QUICK_START

### How It Works:

1. **Automatic Detection**: The system scans filenames AND PDF content to identify vehicle type
2. **Content Extraction**: PDFs are processed and text content is extracted
3. **Intelligent Search**: When users report issues, the AI searches the correct vehicle's manuals
4. **Contextual Responses**: Troubleshooting responses include relevant manual excerpts

### Priority Vehicle Support:

The system prioritizes the **main Cadillac electric vehicles**:
1. **LYRIQ** - Luxury electric SUV (default selection)
2. **VISTIQ** - Three-row electric luxury SUV
3. **OPTIQ** - Compact luxury electric SUV

### Adding New Manuals:

1. Place PDF files in this directory
2. Use descriptive filenames that include vehicle type and manual type
3. Click "🔄 Reload Knowledge Base" in the AI Troubleshooting interface
4. The system will automatically process and index new manuals

### Supported Formats:
- PDF files (.pdf)
- Maximum size: 50MB per file
- Text-based PDFs work best (not scanned images)

### Example Usage:

When a user selects "VISTIQ" as their vehicle type and describes a charging issue:
1. System searches all VISTIQ-specific manuals
2. Finds relevant content about charging procedures
3. Provides AI analysis with manual-specific guidance
4. References exact manual sections for further reading

This ensures users get **vehicle-specific, manual-accurate** troubleshooting help instead of generic responses. 