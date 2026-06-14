import { TooltipProvider } from "@/components/ui/tooltip";
import { useToolStore } from "./store/useToolStore";
import Header from "./components/layout/Header";
import EntryScreen from "./screens/Entry/EntryScreen";
import FlowAScreen from "./screens/FlowA/FlowAScreen";
import FlowBScreen from "./screens/FlowB/FlowBScreen";
import FlowCScreen from "./screens/FlowC/FlowCScreen";
import MixPortfolioScreen from "./screens/MixPortfolio/MixPortfolioScreen";
import ScenarioCompare from "./screens/FlowB/ScenarioCompare";
import ExportScreen from "./screens/Export/ExportScreen";
import FlowDScreen from "./screens/FlowD/FlowDScreen";
import { AnimatePresence, motion } from "framer-motion";

function AppContent() {
  const { activeFlow } = useToolStore();

  const renderScreen = () => {
    if (!activeFlow) return <EntryScreen />;
    if (activeFlow === 'A') return <FlowAScreen />;
    if (activeFlow === 'B') return <FlowBScreen />;
    if (activeFlow === 'C') return <FlowCScreen />;
    if (activeFlow === 'MIX') return <MixPortfolioScreen />;
    if (activeFlow === 'compare') return <ScenarioCompare />;
    if (activeFlow === 'export') return <ExportScreen />;
    if (activeFlow === 'D') return <FlowDScreen />;
    return <EntryScreen />;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2', fontFamily: 'Poppins, sans-serif' }}>
      <Header />
      <div className="pt-[56px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFlow || 'entry'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return <TooltipProvider><AppContent /></TooltipProvider>;
}
