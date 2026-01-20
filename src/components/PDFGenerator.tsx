import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';

interface PDFGeneratorProps {
  recordId: string;
  onReset: () => void;
}

export default function PDFGenerator({ recordId, onReset }: PDFGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const addStep = (step: string) => {
    setSteps((prev) => [...prev, step]);
  };

  const generatePDF = async () => {
    setGenerating(true);
    setError(null);
    setSteps([]);
    setPdfUrl(null);

    try {
      addStep('Initializing PDF generation...');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      addStep('Fetching health record data from database...');

      const apiUrl = `${supabaseUrl}/functions/v1/generate-health-report`;

      addStep('Connecting to PDF generation service...');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordId }),
      });

      addStep('Processing health data...');

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      addStep('Creating PDF document structure...');
      addStep('Adding patient information section...');
      addStep('Adding vital signs section...');
      addStep('Adding medical details section...');
      addStep('Formatting and styling PDF...');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      addStep('PDF generated successfully!');

      setPdfUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      addStep('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Health Record Created!</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Your health record has been saved successfully. Record ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{recordId}</span>
        </p>

        {!pdfUrl && !generating && (
          <button
            onClick={generatePDF}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-green-700 transition-colors mb-4"
          >
            Generate PDF Report
          </button>
        )}

        {steps.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">PDF Generation Steps:</h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  {index === steps.length - 1 && generating ? (
                    <Loader2 className="w-4 h-4 text-blue-600 mt-0.5 animate-spin flex-shrink-0" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ${
                      step.startsWith('Error:') ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                  )}
                  <span className={`text-sm ${
                    step.startsWith('Error:') ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {pdfUrl && (
          <div className="space-y-4">
            <a
              href={pdfUrl}
              download={`health-report-${recordId}.pdf`}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download PDF Report
            </a>

            <iframe
              src={pdfUrl}
              className="w-full h-96 border border-gray-300 rounded-lg"
              title="PDF Preview"
            />
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full mt-4 bg-gray-200 text-gray-700 py-2 px-6 rounded-md font-semibold hover:bg-gray-300 transition-colors"
        >
          Create Another Record
        </button>
      </div>
    </div>
  );
}
