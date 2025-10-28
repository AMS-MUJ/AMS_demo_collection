import React, { useState } from "react";
import axios from "axios";

export default function SubmissionForm() {
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length !== 3) {
      alert("Please upload exactly 3 photos.");
      return;
    }
    setPhotos(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !section || !academicYear || !registrationNumber) {
      alert("Please fill in all details.");
      return;
    }

    if (photos.length !== 3) {
      alert("Please upload exactly 3 photos.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("section", section);
    formData.append("academicYear", academicYear);
    formData.append("registrationNumber", registrationNumber);
    photos.forEach((photo) => formData.append("photos", photo));

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        "https://ams-demo-collection-1-undw.onrender.com/api/submissions",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 200 || res.status === 201) {
        setMessage("✅ Submission successful!");
      } else {
        setMessage("❌ Submission failed, please try again.");
      }
    } catch (err) {
      console.error("Error submitting:", err);
      setMessage("❌ Error submitting data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Submit Photos</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            style={{ display: "block", margin: "10px 0" }}
          />
        </div>

        <div>
          <label>Section:</label>
          <input
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g., A"
            required
            style={{ display: "block", margin: "10px 0" }}
          />
        </div>

        <div>
          <label>Academic Year:</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
            style={{ display: "block", margin: "10px 0" }}
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

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
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFilesChange}
            required
          />
        </div>

        <button type="submit" style={{ marginTop: "15px" }} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {message && <p style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>}
    </div>
  );
}
