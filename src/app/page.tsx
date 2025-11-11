import TranscriptBuilder from "@/components/TranscriptBuilder";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mb-6 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-yellow-900">
            ⚠️ Proof of Concept - Educational Purpose Only
          </h2>
          <p className="text-sm text-yellow-800">
            This application is a <strong>proof of concept</strong> created to test and understand how to generate transcripts. 
            It should <strong>NOT</strong> be used to generate fake or fraudulent transcripts. 
            This tool is intended solely for educational and technical research purposes.
          </p>
        </div>
        <TranscriptBuilder />
      </main>
    </div>
  );
}
