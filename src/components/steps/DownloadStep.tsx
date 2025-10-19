import { useAppContext } from "../../context/AppContext";
import DownloadComponent from "../DownloadComponent";

export default function DownloadStep() {
  const { state } = useAppContext();

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Download Your Resume
        </h2>
        <p className="text-gray-600">
          Your ATS-friendly resume is ready for download.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {state.resumeData && state.selectedTemplate ? (
          <DownloadComponent
            resumeData={state.resumeData}
            template={state.selectedTemplate}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No resume data available. Please go back and complete the previous
              steps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
