import axios from 'axios';

const handleSubmit = async () => {
  if (!registrationNumber || photos.length !== 3) {
    alert("Please enter registration number and capture 3 photos.");
    return;
  }

  try {
    const res = await axios.post("https://ams-demo-collection-1-undw.onrender.com/api/submissions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert(response.data.message); // "Submission successful"
    // Reset form if needed
  } catch (error) {
    console.error(error);
    alert("Submission failed. Try again.");
  }
};
