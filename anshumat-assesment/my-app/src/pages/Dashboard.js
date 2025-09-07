import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    education: "",
    experience: "",
    skills: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch resumes
  async function loadResumes() {
    try {
      const res = await fetch(`${API}/resume`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setResumes(data);
    } catch (err) {
      console.error("Error loading resumes", err);
    }
  }

  // Save resume
  async function saveResume(e) {
    e.preventDefault();
    try {
      await fetch(`${API}/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          personal: { name: form.name, email: form.email },
          education: form.education,
          experience: form.experience,
          skills: form.skills,
        }),
      });
      setForm({ name: "", email: "", education: "", experience: "", skills: "" });
      loadResumes();
    } catch (err) {
      console.error("Error saving resume", err);
    }
  }

  // Delete resume
  async function deleteResume(id) {
    await fetch(`${API}/resume/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    loadResumes();
  }

  // Download resume PDF
  async function downloadPDF(id) {
    const res = await fetch(`${API}/resume/${id}/pdf`, {
      headers: { Authorization: "Bearer " + token },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/signin");
  }

  useEffect(() => {
    loadResumes();
  }, []);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>Resume Dashboard</h1>
      
      </header>

      <section className="form-section">
        <h2>Create New Resume</h2>
        <form onSubmit={saveResume} className="resume-form">
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Education"
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value })}
          />
          <textarea
            placeholder="Experience"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
          />
          <textarea
            placeholder="Skills"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
          <button type="submit" className="btn-primary">Save Resume</button>
        </form>
      </section>

      <section className="resume-list">
        <h2>Your Resumes</h2>
        {resumes.length === 0 ? (
          <p>No resumes yet. Create one above!</p>
        ) : (
          resumes.map((r) => (
            <div key={r._id} className="resume-card">
              <h3>{r.personal?.name}</h3>
              <p>{r.personal?.email}</p>
              <p><b>Education:</b> {r.education}</p>
              <p><b>Experience:</b> {r.experience}</p>
              <p><b>Skills:</b> {r.skills}</p>
              <div className="resume-actions">
                <button onClick={() => downloadPDF(r._id)}>Download PDF</button>
                <button onClick={() => deleteResume(r._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
