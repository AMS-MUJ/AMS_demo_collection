import React, { useState } from "react";
import { Camera, CheckCircle2, XCircle, Upload, User, Trash2 } from "lucide-react";
import axios from "axios";

const PhotoSubmission = () => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [photos, setPhotos] = useState([null, null, null]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [message, setMessage] = useState("");

  const allPhotosSelected = photos.every((p) => p);
  const isSuccess = message.includes("✅");
  const isError = message.includes("❌");

  const handleCapture = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const updatedPhotos = [...photos];
    updatedPhotos[index] = file;
    setPhotos(updatedPhotos);

    // Update current index if needed
    const nextIndex = updatedPhotos.findIndex((p) => !p);
    setCurrentPhotoIndex(nextIndex === -1 ? 3 : nextIndex);
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = null;
    setPhotos(updatedPhotos);

    if (index < currentPhotoIndex) setCurrentPhotoIndex(index);
    else if (currentPhotoIndex === 3) setCurrentPhotoIndex(index);
  };

  const handleSubmit = async () => {
    if (!registrationNumber) {
      setMessage("❌ Please enter your registration number");
      return;
    }
    if (photos.some((p) => !p)) {
      setMessage("❌ Please capture all 3 photos");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("registrationNumber", registrationNumber);
      photos.forEach((photo) => formData.append("photos", photo));

      const res = await axios.post("https://ams-demo-collection-1-undw.onrender.com/api/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });


      if (res.status === 200 || res.status === 201) {
        setMessage("✅ Submitted successfully!");
      } else {
        setMessage("❌ Submission failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Submission failed");
    }
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-white mb-4 shadow-lg">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">Manipal University</h1>
          <p className="text-gray-500 text-lg">Photo Submission Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-10">
          {/* Registration Input */}
          <div className="mb-8">
            <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Registration Number
            </label>
            <input
              type="text"
              placeholder="Enter your registration number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Photo Capture */}
          {currentPhotoIndex < 3 ? (
            <div className="mb-8">
              <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all duration-300">
                <Camera className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold mb-2 text-lg">
                  Capture Photo {currentPhotoIndex + 1} of 3
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Position yourself clearly in frame
                </p>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-300 text-white rounded-xl font-semibold cursor-pointer hover:scale-105 transition-all duration-300">
                  <Upload className="w-5 h-5" /> Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleCapture(e, currentPhotoIndex)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-600 font-semibold text-lg">All 3 photos captured!</p>
              <p className="text-gray-400 text-sm mt-2">Ready to submit</p>
            </div>
          )}

          {/* Photo Previews */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 transition-all duration-300 hover:scale-105"
              >
                {photo ? (
                  <>
                    <img src={URL.createObjectURL(photo)} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <Camera className="w-8 h-8 mb-2" />
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!allPhotosSelected || !registrationNumber}
            className="w-full bg-linear-to-r from-blue-500 via-blue-400 to-blue-300 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Application
          </button>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${isSuccess ? "bg-green-50 border-green-300 text-green-600" : isError ? "bg-red-50 border-red-300 text-red-600" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
              {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {isError && <XCircle className="w-5 h-5" />}
              <p className="font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Powered by Manipal University Digital Services</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoSubmission;
