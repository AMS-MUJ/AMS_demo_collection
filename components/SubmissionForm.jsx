import React, { useState } from "react";

export default function SubmissionForm() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [photos, setPhotos] = useState([]);

  // handle file selection
  const handleFilesChange = (e) => {
    setPhotos(e.target.files);
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photos.length !== 3) {
      alert("Please upload exactly 3 photos.");
      return;
    }

    const formData = new FormData();
    formData.append("registrationNumber", registrationNumber);

    // append all selected photos
    for (let i = 0; i < photos.length; i++) {
      formData.append("photos", photos[i]);
    }

    try {
      const res = await axios.post("https://ams-demo-collection-1-undw.onrender.com/api/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Submission successful!");
      } else {
        alert(data.message || "Submission failed!");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error submitting data");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Submit Photos</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Registration Number:</label>
          <input
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="Enter your Reg No"
            required
            style={{ display: "block", margin: "10px 0" }}
          />
        </div>

        <div>
          <label>Upload 3 Photos:</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesChange}
            required
          />
        </div>

        <button type="submit" style={{ marginTop: "15px" }}>
          Submit
        </button>
      </form>
    </div>
  );
}
