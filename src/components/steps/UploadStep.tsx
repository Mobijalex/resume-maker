import { useAppContext } from "../../context/AppContext";
import FileUploadComponent from "../FileUploadComponent";
import TextInputComponent from "../TextInputComponent";

export default function UploadStep() {
  const { state, dispatch } = useAppContext();

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Upload Your Resume
        </h2>
        <p className="text-gray-600">
          Upload your Markdown resume file or paste the content directly below.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* File Upload Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Option 1: Upload File
          </h3>
          <FileUploadComponent />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Direct Text Input Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Option 2: Direct Input
          </h3>
          <TextInputComponent />
        </div>

        {/* Status indicator */}
        {(state.uploadedFile || state.markdownContent.trim()) && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-lg mb-4">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-medium">
                {state.uploadedFile
                  ? `File uploaded: ${state.uploadedFile.name}`
                  : "Direct input content ready"}
              </span>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Your content is ready to be processed. Click below to continue.
              </p>
              <button
                onClick={() => dispatch({ type: "SET_STEP", payload: "parse" })}
                className="btn-primary"
                data-testid="proceed-to-parse"
              >
                Process Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
