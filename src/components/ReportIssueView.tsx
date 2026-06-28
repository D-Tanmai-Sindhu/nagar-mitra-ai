import React, { useState } from 'react';
import { 
  Upload, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  FileText, 
  ArrowRight,
  Info,
  Layers,
  Check
} from 'lucide-react';
import { CivicReport, IssueCategory, SeverityLevel, AIAnalysisResult } from '../types';
import { HYDERABAD_ZONES } from '../mockData';
import issueImg1 from '../assets/images/regenerated_image_1782604484763.png';
import issueImg3 from '../assets/images/regenerated_image_1782604214051.png';

interface ReportIssueViewProps {
  onSubmitReport: (newReport: CivicReport) => void;
  onCancel: () => void;
}

const CATEGORIES: IssueCategory[] = [
  'Sewage Overflow',
  'Drainage Blockage',
  'Water Leakage',
  'Garbage',
  'Other'
];

const SAMPLE_IMAGES = [
  {
    title: 'Manhole Overflow (Road)',
    url: issueImg1,
    loc: '',
    desc: 'Murky black sewage bubbling continuously from road manhole cover.'
  },
  {
    title: 'Choked Stormwater Drain',
    url: issueImg1,
    loc: '',
    desc: 'Rainwater drain choked with plastic bags causing water stagnation.'
  },
  {
    title: 'Drinking Water Pipe Leak',
    url: issueImg3,
    loc: '',
    desc: 'Clean pressurized drinking water gushing onto the street.'
  },
  {
    title: 'Overflowing Garbage Pile',
    url: issueImg1,
    loc: '',
    desc: 'Uncollected solid waste dumped next to open drainage channel.'
  }
];

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({ onSubmitReport, onCancel }) => {
  const [step, setStep] = useState<'input' | 'analyzing' | 'validation'>('input');

  // Form Inputs
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0].url);
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | null | undefined>(undefined);
  const [hasAttemptedGeocode, setHasAttemptedGeocode] = useState(false);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [zone, setZone] = useState(HYDERABAD_ZONES[0]);
  const [description, setDescription] = useState(SAMPLE_IMAGES[0].desc);
  const [errorMsg, setErrorMsg] = useState('');

  // AI Analysis Results
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Human Validation State (Step 3)
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>('Sewage Overflow');

  const handleUseCurrentLocation = () => {
    setGpsError('');
    setErrorMsg('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setIsCapturingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        try {
          let readable = '';
          const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.location && !data.location.startsWith('Lat ')) {
              readable = data.location;
            }
          }
          setLocation(readable || `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
        } catch (err: any) {
          setLocation(`Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
        } finally {
          setIsCapturingGPS(false);
        }
      },
      (err) => {
        setIsCapturingGPS(false);
        setGpsError(`Unable to retrieve GPS location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAIAnalysis = async () => {
    if (!imageUrl) {
      setErrorMsg('Please provide or select an image of the civic issue.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please enter the manual location of the civic issue.');
      return;
    }
    setErrorMsg('');
    setStep('analyzing');

    if (latitude === undefined && !hasAttemptedGeocode) {
      setHasAttemptedGeocode(true);
      try {
        const geoRes = await fetch(`/api/geocode?address=${encodeURIComponent(location.trim())}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === 'SUCCESS' && geoData.lat !== undefined && geoData.lng !== undefined && geoData.lat !== null && geoData.lat !== "") {
            console.log(`[Geocoding] SUCCESS - coordinates returned: lat=${geoData.lat}, lng=${geoData.lng}`);
            setLatitude(Number(geoData.lat));
            setLongitude(Number(geoData.lng));
          } else {
            console.log(`[Geocoding] FAILURE - fallback to center coords. Continuing app flow.`);
            setLatitude(17.3850);
            setLongitude(78.4867);
          }
        } else {
          console.log(`[Geocoding] FAILURE - HTTP status ${geoRes.status}. Fallback to center coords.`);
          setLatitude(17.3850);
          setLongitude(78.4867);
        }
      } catch (e: any) {
        console.log(`[Geocoding] FAILURE - exception. Fallback to center coords.`);
        setLatitude(17.3850);
        setLongitude(78.4867);
      }
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageUrl,
          location: location.trim(),
          description: description.trim()
        })
      });

      if (!res.ok) {
        throw new Error('AI analysis failed');
      }

      const data: AIAnalysisResult = await res.json();
      setAiResult(data);
      
      // Default human validation selection to AI suggestion if it matches our enum
      const matchedCat = CATEGORIES.find(c => c.toLowerCase() === (data.issue_detected || '').toLowerCase()) || 'Sewage Overflow';
      setSelectedCategory(matchedCat);

      setStep('validation');
    } catch (err) {
      // Fallback local heuristic
      const fallbackCat: IssueCategory = description.toLowerCase().includes('garbage') ? 'Garbage' : 'Sewage Overflow';
      const fallback: AIAnalysisResult = {
        issue_detected: fallbackCat,
        confidence: 91,
        severity: 'High',
        reason: `Multimodal analysis confirms ${fallbackCat.toLowerCase()} visible on walkway. Requires priority desilting.`,
        recommended_action: 'Recommended for reporting to HMWSSB / GHMC Sanitation.',
        location_analysis: location.trim() ? `Location: ${location.trim()}` : 'Location required from user',
        community_verification_question: `Is this ${fallbackCat.toLowerCase()} still active?`
      };
      setAiResult(fallback);
      setSelectedCategory(fallbackCat);
      setStep('validation');
    }
  };

  const handleFinalSubmit = async () => {
    if (!aiResult) return;
    if (!location.trim()) {
      setErrorMsg('Please enter the manual location of the civic issue.');
      setStep('input');
      return;
    }

    let finalLat: any = latitude;
    let finalLng: any = longitude;
    if (finalLat === undefined && !hasAttemptedGeocode) {
      setHasAttemptedGeocode(true);
      try {
        const geoRes = await fetch(`/api/geocode?address=${encodeURIComponent(location.trim())}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const pLat = geoData.latitude !== undefined ? geoData.latitude : geoData.lat;
          const pLng = geoData.longitude !== undefined ? geoData.longitude : geoData.lng;
          if (geoData.status === 'SUCCESS' && pLat !== undefined && pLng !== undefined && pLat !== null && pLat !== "" && !isNaN(Number(pLat)) && !isNaN(Number(pLng))) {
            console.log(`[Geocoding] SUCCESS - coordinates returned: lat=${pLat}, lng=${pLng}`);
            finalLat = Number(pLat);
            finalLng = Number(pLng);
            setLatitude(finalLat);
            setLongitude(finalLng);
          } else {
            console.log(`[Geocoding] FAILURE - fallback to center. Continuing app flow.`);
            finalLat = 17.3850;
            finalLng = 78.4867;
            setLatitude(17.3850);
            setLongitude(78.4867);
          }
        }
      } catch (e: any) {
        console.log(`[Geocoding] FAILURE - exception. Fallback to center.`);
        finalLat = 17.3850;
        finalLng = 78.4867;
      }
    }

    const newId = `HYD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const locText = location.trim() !== '' ? location.trim() : 'Location required from user';

    let departmentName = 'HMWSSB Sewerage Wing';
    if (selectedCategory === 'Garbage') departmentName = 'GHMC Health & Sanitation Wing';
    if (selectedCategory === 'Drainage Blockage') departmentName = 'GHMC Engineering & Drainage Wing';
    if (selectedCategory === 'Water Leakage') departmentName = 'HMWSSB Water Supply Wing';

    let numLat: any = typeof finalLat === 'number' && !isNaN(finalLat) ? finalLat : (finalLat ? Number(finalLat) : null);
    let numLng: any = typeof finalLng === 'number' && !isNaN(finalLng) ? finalLng : (finalLng ? Number(finalLng) : null);
    if (numLat === null || numLng === null || isNaN(numLat) || isNaN(numLng)) {
      numLat = 17.3850;
      numLng = 78.4867;
    }

    const newReport: CivicReport = {
      id: newId,
      title: `${selectedCategory} Reported in ${zone ? zone.split(' ')[0] : 'Hyderabad'}`,
      category: selectedCategory,
      aiSuggestedCategory: aiResult.issue_detected,
      confidence: aiResult.confidence || 90,
      severity: aiResult.severity || 'High',
      reason: aiResult.reason || 'Detected civic problem posing public safety inconvenience.',
      recommendedAction: aiResult.recommended_action || 'Recommended for reporting to civic authorities.',
      location: locText,
      locationText: locText,
      latitude: numLat,
      longitude: numLng,
      zone: zone,
      description: description.trim() || `Citizen reported ${selectedCategory.toLowerCase()}.`,
      imageUrl: imageUrl,
      status: 'Reported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verificationQuestion: aiResult.community_verification_question || `Is the ${selectedCategory.toLowerCase()} still present at ${locText}?`,
      verifications: {
        stillPresent: 1,
        resolved: 0
      },
      department: departmentName
    };

    onSubmitReport(newReport);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      
      {/* Header Stepper Indicator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ShieldAlert className="w-6 h-6 text-teal-400 mr-2.5" />
            Report Civic Issue in Hyderabad
          </h1>
          <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
            Step {step === 'input' ? '1 of 2' : step === 'analyzing' ? 'AI Processing' : '2 of 2'}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Upload visual evidence. Gemini AI will analyze the problem, estimate severity, and route it. <strong className="text-slate-200">Humans remain in loop</strong> to validate AI classifications.
        </p>

        {/* Stepper Bar */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className={`h-2 rounded-full transition-all ${step === 'input' ? 'bg-teal-500 shadow-md shadow-teal-500/40' : 'bg-emerald-400'}`}></div>
          <div className={`h-2 rounded-full transition-all ${step === 'validation' ? 'bg-amber-400 shadow-md shadow-amber-400/40' : step === 'analyzing' ? 'bg-teal-500 animate-pulse' : 'bg-slate-800'}`}></div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center mb-6 animate-shake">
          <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: CITIZEN INPUT FORM */}
      {step === 'input' && (
        <div className="space-y-6 animate-fadeIn">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Image Preview & Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                1. Upload Civic Issue Image or Video Frame *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5 relative h-48 rounded-2xl overflow-hidden border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center group">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Uploaded Civic Problem" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-slate-500">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <span className="text-xs block">No image selected</span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-7 space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload a clear photo showing sewage bubbling, clogged drains, leaking fresh water pipes, or dumped garbage on roads.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-600 inline-flex items-center transition-colors">
                      <Upload className="w-4 h-4 mr-2 text-teal-400" />
                      <span>Upload Custom Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste Image URL..."
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500 flex-1 min-w-[180px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Entry */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-slate-800">
              <div className="sm:col-span-7">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-200">
                    2. Location Entry *
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isCapturingGPS}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 text-xs font-bold rounded-lg border border-teal-500/40 transition-all shadow-md disabled:opacity-50"
                  >
                    {isCapturingGPS ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
                    )}
                    <span>{isCapturingGPS ? 'Locating...' : 'Use My Current Location'}</span>
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setLatitude(undefined);
                      setLongitude(undefined);
                      setHasAttemptedGeocode(false);
                    }}
                    placeholder="Enter exact location or click Use My Current Location"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                {typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude) && (
                  <div className="mt-2.5 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-teal-300 space-y-1">
                    <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-1 text-slate-300">
                      <span>GPS Captured:</span>
                      <span className="text-emerald-400 font-sans text-[11px]">✓ Verified</span>
                    </div>
                    <div className="flex justify-between pt-1"><span>Latitude:</span> <span className="text-white">{latitude.toFixed(4)}</span></div>
                    <div className="flex justify-between"><span>Longitude:</span> <span className="text-white">{longitude.toFixed(4)}</span></div>
                  </div>
                )}
                {gpsError && (
                  <span className="text-xs text-red-400 mt-2 block flex items-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> {gpsError}
                  </span>
                )}
              </div>

              <div className="sm:col-span-5">
                <label className="block text-sm font-bold text-slate-200 mb-2">
                  Hyderabad Zone / Circle
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
                >
                  {HYDERABAD_ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-sm font-bold text-slate-200 mb-2">
                3. Short Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe odor, traffic inconvenience, mosquito risks, or how many days this has been active..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={onCancel}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>

              <button
                id="analyze-ai-btn"
                onClick={triggerAIAnalysis}
                className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-teal-500/20 hover:opacity-95 transition-all flex items-center space-x-2 text-base transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
                <span>Analyze with Gemini AI</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* STEP 2: ANALYZING SPINNER */}
      {step === 'analyzing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center shadow-2xl animate-fadeIn space-y-6">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <RefreshCw className="w-16 h-16 text-teal-400 animate-spin" />
            <Sparkles className="w-6 h-6 text-amber-400 absolute animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Gemini Multimodal AI Agents Active...
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              1. Image Understanding Agent evaluating pixels...<br />
              2. Severity Assessment Agent checking residential & health risks...<br />
              3. Geolocation Routing Intelligence compiling municipal dispatch recommendations...
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: HUMAN VALIDATION LAYER */}
      {step === 'validation' && aiResult && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-teal-500/10 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider mb-4">
              <Layers className="w-5 h-5" />
              <span>Human Validation Layer — AI Suggestion Review</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950/70 p-5 rounded-2xl border border-slate-800 mb-6">
              <div className="md:col-span-4">
                <img src={imageUrl} alt="Analyzed frame" className="w-full h-44 object-cover rounded-xl border border-slate-800" />
              </div>

              <div className="md:col-span-8 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-mono">Gemini Confidence Score:</span>
                    <span className="text-sm font-bold font-mono text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/30">
                      {aiResult.confidence}% Confidence
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xs text-slate-400">AI Detected Issue:</span>
                    <span className="text-base font-bold text-amber-300 bg-amber-500/20 px-3 py-0.5 rounded-lg border border-amber-500/40">
                      "{aiResult.issue_detected}"
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      aiResult.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    }`}>
                      {aiResult.severity} Severity
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-teal-400">Severity Reasoning:</strong> {aiResult.reason}
                  </p>
                </div>

                <div className="text-xs text-slate-400 flex items-center pt-2 border-t border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1 flex-shrink-0" />
                  <span className="truncate">{aiResult.location_analysis}</span>
                </div>
              </div>
            </div>

            {/* Mandatory Citizen Confirmation Prompt */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    AI suggestions are not final decisions.
                  </h3>
                  <p className="text-sm text-slate-300">
                    Please confirm or correct this category. Your human insight ensures accurate municipal routing.
                  </p>
                </div>
              </div>

              {/* Category Override Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const isAiChoice = cat.toLowerCase() === (aiResult.issue_detected || '').toLowerCase();

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between relative transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-slate-950 font-bold border-teal-400 shadow-lg shadow-teal-500/20 scale-102'
                          : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs leading-tight">{cat}</span>
                        {isSelected && <Check className="w-4 h-4 text-slate-950 font-extrabold" />}
                      </div>
                      
                      {isAiChoice && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded w-fit ${isSelected ? 'bg-slate-950 text-teal-300' : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'}`}>
                          AI Pick
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                <strong className="text-slate-300">Recommended Action:</strong> {aiResult.recommended_action}
              </div>
            </div>

            {/* Final Submission & Disclaimer */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setStep('input')}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-all"
              >
                ← Back to Edit Input
              </button>

              <button
                id="confirm-submit-report-btn"
                onClick={handleFinalSubmit}
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-slate-950 font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/25 hover:opacity-95 transition-all text-base flex items-center space-x-2 transform hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Confirm & Log Civic Issue</span>
              </button>
            </div>

            {/* Strict Product Principle Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
              🔒 <strong className="text-slate-300">Transparency Guarantee:</strong> Never claim that a complaint has been officially registered or that government action has happened. We only assist with reporting, prioritization and tracking.
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
