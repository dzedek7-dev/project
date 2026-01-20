import { useState } from 'react';
import { FileHeart } from 'lucide-react';
import HealthForm from './components/HealthForm';
import PDFGenerator from './components/PDFGenerator';

function App() {
  const [recordId, setRecordId] = useState<string | null>(null);

  const handleRecordCreated = (id: string) => {
    setRecordId(id);
  };

  const handleReset = () => {
    setRecordId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileHeart className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Health Report Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Collect patient health data and generate professional PDF reports
          </p>
        </div>

        {!recordId ? (
          <HealthForm onRecordCreated={handleRecordCreated} />
        ) : (
          <PDFGenerator recordId={recordId} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

export default App;
