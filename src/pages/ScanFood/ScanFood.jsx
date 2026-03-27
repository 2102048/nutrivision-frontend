import React, { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Camera, 
  MessageSquare, 
  Scale, 
  ChevronRight, 
  CheckCircle2, 
  Trash2, 
  X 
} from 'lucide-react';

import {
  scanFoodImage,
  getScannedNutrition,
  aiFoodLog
} from "../../services/api";

import VoiceFoodLogger from "../../components/VoiceFoodLogger";

const API = "http://localhost:8000";

const ScanFood = () => {
  const { addMeal } = useContext(AppContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const reviewRef = useRef(null);

  const [mode, setMode] = useState("ai");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingType, setProcessingType] = useState("");
  const [scannedFood, setScannedFood] = useState(null);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [category, setCategory] = useState("Snack");
  const [aiInput, setAiInput] = useState("");
  const [aiFoods, setAiFoods] = useState([]);
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState("g");

  // Scroll to review section when food is detected or items are added
  useEffect(() => {
    if ((aiFoods.length > 0 || scannedFood) && reviewRef.current) {
      reviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [aiFoods.length, scannedFood]);

  // Recalculate totals and meal name when aiFoods list changes
  useEffect(() => {
    if (aiFoods.length === 0) {
      // Don't reset if we have a scanned food item manually set
      if (!scannedFood) {
        setFood(""); setCalories(""); setProtein(""); setCarbs(""); setFat("");
      }
      return;
    };
    
    const totalCalories = aiFoods.reduce((s, f) => s + (Number(f.calories) || 0), 0);
    const totalProtein = aiFoods.reduce((s, f) => s + (Number(f.protein) || 0), 0);
    const totalCarbs = aiFoods.reduce((s, f) => s + (Number(f.carbs) || 0), 0);
    const totalFat = aiFoods.reduce((s, f) => s + (Number(f.fat) || 0), 0);

    setCalories(totalCalories);
    setProtein(totalProtein);
    setCarbs(totalCarbs);
    setFat(totalFat);

    const names = aiFoods.map(f => f.food_name).join(", ");
    setFood(names);
  }, [aiFoods, scannedFood]);

  const handleDeleteItem = (index) => {
    const updated = aiFoods.filter((_, i) => i !== index);
    setAiFoods(updated);
  };

  const triggerNotificationCheck = async () => {
    if (!token) return;
    try {
      await axios.post(`${API}/notifications/trigger-check`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.log("❌ Notification trigger failed", err);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    try {
      setLoading(true);
      setProcessingType("scan");
      const scanResult = await scanFoodImage(image);
      const detectedFood = scanResult.food_detected;
      setScannedFood(detectedFood);
      setFood(detectedFood);
      await fetchNutrition(detectedFood, quantity, unit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setProcessingType("");
    }
  };

  const fetchNutrition = async (foodName, qty, u) => {
    if (!foodName) return;
    try {
      setLoading(true);
      setProcessingType("nutrition");
      const nutritionData = await getScannedNutrition(foodName, qty, u);
      const n = nutritionData?.nutrition;
      setCalories(n?.calories ?? "");
      setProtein(n?.protein ?? "");
      setCarbs(n?.carbs ?? "");
      setFat(n?.fat ?? "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setProcessingType("");
    }
  };

  const handleAIInput = async (text) => {
    if (!text) return;
    try {
      setLoading(true);
      setProcessingType("ai");
      const result = await aiFoodLog(text);
      const foods = result?.foods || [];
      if (foods.length > 0) {
        setAiFoods(foods.map(f => ({ ...f, category: "Snack" })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setProcessingType("");
    }
  };

  const handleCentralCategory = (value) => {
    setCategory(value);
    setAiFoods(aiFoods.map(f => ({ ...f, category: value })));
  };

  const handleIndividualCategory = (index, value) => {
    const updated = [...aiFoods];
    updated[index].category = value;
    setAiFoods(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setProcessingType("submit");
      if (aiFoods.length > 0) {
        await Promise.all(aiFoods.map(item => addMeal({
          name: item.food_name,
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          category: item.category
        })));
      } else {
        await addMeal({
          name: food,
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
          category
        });
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      await triggerNotificationCheck();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setProcessingType("");
    }
  };

  // Reusable Guidance Component for consistency
  const GuidanceMessage = () => (
    <div className="flex items-center gap-2 justify-center py-2 px-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-200 animate-in fade-in zoom-in duration-300">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
      <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
        Review below & tap "Add to Daily Log" to save
      </p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="text-center space-y-1 mt-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Log Meal</h1>
        <p className="text-slate-500 font-medium">Add nutrition to your daily log</p>
      </div>

      {/* MODE TABS */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            mode === "ai" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <MessageSquare size={18} /> Describe
        </button>
        <button
          onClick={() => setMode("scan")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            mode === "scan" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Camera size={18} /> Scan
        </button>
      </div>

      {/* AI MODE */}
      {mode === "ai" && (
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 space-y-6">
          <div className="relative group">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAIInput(aiInput)}
              placeholder="Example: I ate 2 chicken momos"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium pr-12 shadow-inner"
            />
            <button 
              onClick={() => handleAIInput(aiInput)}
              className="absolute right-3 top-3 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl group">
            <div className={`absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-700 transition-opacity duration-500 ${processingType === 'ai' ? 'opacity-90' : 'opacity-100'}`} />
            <div className="relative p-6 text-center text-white space-y-2">
              {processingType === "ai" ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="font-bold animate-pulse text-sm">AI is analyzing ingredients...</p>
                </div>
              ) : (
                <VoiceFoodLogger onText={handleAIInput} label="🎤 Tap to Speak" className="w-full text-lg font-black" />
              )}
            </div>
          </div>

          {aiFoods.length > 0 && (
            <div ref={reviewRef} className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Identified Items</h3>
                <select 
                  value={category} 
                  onChange={(e) => handleCentralCategory(e.target.value)}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border-none outline-none"
                >
                  {["Breakfast", "Lunch", "Dinner", "Snack"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                {aiFoods.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 capitalize leading-tight">{item.food_name}</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                        {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        value={item.category} 
                        onChange={(e) => handleIndividualCategory(index, e.target.value)}
                        className="text-[10px] uppercase font-black text-slate-400 bg-white border border-slate-200 rounded-lg p-1.5 focus:border-blue-300 outline-none"
                      >
                        {["Breakfast", "Lunch", "Dinner", "Snack"].map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button 
                        onClick={() => handleDeleteItem(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guidance Message added here for AI Mode */}
              <GuidanceMessage />
            </div>
          )}
        </div>
      )}

      {/* SCAN MODE */}
      {mode === "scan" && (
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 space-y-6">
          {!preview ? (
            <label className="flex flex-col items-center justify-center aspect-square border-4 border-dashed border-slate-100 rounded-4xl cursor-pointer hover:bg-slate-50 hover:border-blue-200 transition-all group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={32} />
              </div>
              <span className="text-slate-900 font-bold">Select Food Photo</span>
              <span className="text-slate-400 text-sm font-medium mt-1">Click to browse gallery</span>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                setImage(file);
                if(file) setPreview(URL.createObjectURL(file));
              }} className="hidden" />
            </label>
          ) : (
            <div className="relative rounded-4xl overflow-hidden group aspect-square">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => {setPreview(null); setImage(null); setScannedFood(null);}} 
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-xl backdrop-blur-md flex items-center gap-1 text-xs font-bold"
              >
                <X size={14} /> Change
              </button>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={!image || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            {processingType === "scan" ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={20} />}
            {processingType === "scan" ? "Scanning Image..." : "Analyze Image"}
          </button>

          {scannedFood && (
            <div ref={reviewRef} className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in duration-500">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle2 size={18} />
                <span className="font-bold">Detected: {scannedFood}</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 ml-1">Quantity</p>
                  <div className="relative">
                    <input type="number" value={quantity} onChange={(e) => { setQuantity(Number(e.target.value)); fetchNutrition(scannedFood, Number(e.target.value), unit); }} className="w-full p-3 bg-white rounded-xl border border-blue-200 outline-none font-bold text-slate-800" />
                    <Scale size={16} className="absolute right-3 top-3.5 text-blue-300" />
                  </div>
                </div>
                <div className="w-32 space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 ml-1">Unit</p>
                  <select value={unit} onChange={(e) => { setUnit(e.target.value); fetchNutrition(scannedFood, quantity, e.target.value); }} className="w-full p-3 bg-white rounded-xl border border-blue-200 outline-none font-bold text-slate-800">
                    <option value="g">Grams</option>
                    <option value="kg">Kgs</option>
                  </select>
                </div>
              </div>
              
              {/* Guidance Message added here for Scan Mode */}
              <GuidanceMessage />
            </div>
          )}
        </div>
      )}

      {/* FINAL REVIEW FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Scale size={20} className="text-green-500" />
          Final Review
        </h3>

        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-400 ml-1">Total Meal Name</p>
            <input value={food} onChange={(e) => setFood(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-green-500 transition-all outline-none" placeholder="e.g. Lunch at Cafe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Calories", val: calories, set: setCalories, unit: "kcal" },
              { label: "Total Protein", val: protein, set: setProtein, unit: "g" },
              { label: "Total Carbs", val: carbs, set: setCarbs, unit: "g" },
              { label: "Total Fat", val: fat, set: setFat, unit: "g" },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 ml-1">{field.label}</p>
                <div className="relative">
                  <input type="number" value={field.val} onChange={(e) => field.set(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black focus:ring-2 focus:ring-green-500 outline-none" />
                  <span className="absolute right-4 top-4 text-[10px] font-bold text-slate-400">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-400 ml-1">Time Category</p>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-green-500 outline-none">
              {["Breakfast", "Lunch", "Dinner", "Snack"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!food && aiFoods.length === 0)}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-5 rounded-2xl font-black shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {processingType === "submit" ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle2 size={20} />
          )}
          {processingType === "submit" ? "Saving..." : "Add to Daily Log"}
        </button>
      </form>
    </div>
  );
};

export default ScanFood;