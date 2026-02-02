import { useState } from 'react';
import { Camera, Trash2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import axios from 'axios';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          AMS Photo Submission
        </h1>
        <PhotoSubmission />
      </div>
    </div>
  );
}

function PhotoSubmission() {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [photos, setPhotos] = useState([null, null, null]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // ✅ success screen trigger

  const isAcademicComplete = !!(name && section && academicYear && registrationNumber);

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file && currentIndex < 3) {
      const newPhotos = [...photos];
      newPhotos[currentIndex] = file;
      setPhotos(newPhotos);
      setCurrentIndex(currentIndex + 1);
      setMessage(`✅ Photo ${currentIndex + 1} captured!`);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
    if (currentIndex > index) setCurrentIndex(index);
    setMessage('');
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!isAcademicComplete || photos.some((p) => !p)) {
      setMessage('⚠️ Please fill all academic details, registration number, and capture all 3 photos');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('branch', branch);
      formData.append('section', section);
      formData.append('academicYear', academicYear);
      formData.append('registrationNumber', registrationNumber);
      photos.forEach((photo) => formData.append('photos', photo));

      const res = await axios.post(
        'https://ams-demo-collection-1-undw.onrender.com/api/submissions',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (res.status === 200 || res.status === 201) {
        setIsSubmitted(true); // ✅ show success screen
      } else {
        setMessage('❌ Submission failed');
      }
    } catch (err) {
      setMessage('❌ Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen after successful submission
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-10">
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-full">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Thank You!
        </h2>
        <h3 className='text-xl font-semibold text-gray-800 dark:text-white'>Your photos and details have been submitted successfully. We appreciate your participation</h3>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      {/* Academic Details Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Academic Details
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch
            </label>
            <input
              type="text"
              placeholder="Enter your Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Section
            </label>
            <input
              type="text"
              placeholder="Enter your Section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              placeholder="Enter your reg number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>
      </div>

      {/* Photo Capture Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Photo Upload ({currentIndex}/3)
        </h2>

        {!isAcademicComplete && (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 
          dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            Please complete all academic details above to start capturing photos.
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          <label
            htmlFor="photo-capture"
            className={`flex items-center justify-center w-full px-4 py-3.5 border-2 rounded-xl cursor-pointer transition-colors ${isAcademicComplete
              ? 'border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
          >
            <Camera className="w-6 h-6 mr-2" />
            {isAcademicComplete ? `Capture Photo ${currentIndex + 1} of 3` : 'Complete details to capture'}
            <input
              id="photo-capture"
              type="file"
              accept="image/*"
              onChange={handlePhotoCapture}
              disabled={!isAcademicComplete}
              className="hidden"
            />
          </label>

          {/* Photo Previews */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                {photo ? (
                  <>
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isAcademicComplete || photos.some((p) => !p)}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold 
          rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Submit All
            </>
          )}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg text-center font-medium ${message.includes('✅')
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : message.includes('❌')
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
            }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
