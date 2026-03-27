import AINutritionAssistant from "../../components/AINutritionAssistant";

const AIAssistant = () => {
  return (
    <div
      style={{
        // Removes the double-scroll issue by fitting the available space
        height: "calc(100vh - 100px)", 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        overflow: "hidden", // Prevents the outer page from scrolling
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          height: "100%", // Forces the assistant to use the full calculated height
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Main Assistant Component */}
        <AINutritionAssistant />
        
        <p style={{ 
          textAlign: "center", 
          marginTop: "12px", 
          fontSize: "11px", 
          color: "#94a3b8",
          fontWeight: "500" 
        }}>
          All insights are generated from your NutriVision app data.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;