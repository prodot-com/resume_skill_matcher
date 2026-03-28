"use client";

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Trophy } from 'lucide-react';

const DEFAULT_REQUIRED = ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'];

export default function ResumeMatcherPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(DEFAULT_REQUIRED);
  const [newSkill, setNewSkill] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf" && selected.type !== "text/plain") {
      setError("Only PDF and TXT files are supported.");
      return;
    }

    setFile(selected);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selected);

      const response = await fetch("/api/extract-skills", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to parse resume");

      setExtractedSkills(data.skills || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatch = () => {
    if (extractedSkills.length === 0) return { matched: [], score: 0 };
    const matched = requiredSkills.filter(req =>
      extractedSkills.some(skill =>
        skill.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(skill.toLowerCase())
      )
    );
    const score = Math.round((matched.length / requiredSkills.length) * 100);
    return { matched, score };
  };

  const { matched, score } = calculateMatch();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-blue-600">SkillMatcher AI</h1>
            <p className="text-gray-500 mt-2">Next-gen resume analysis powered by Gemini 2.5</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm text-sm font-medium">
            Project Due: 31-03-2026
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar: Config */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload size={20} className="text-blue-500" />
                Upload Resume
              </h2>
              <label className="group relative block cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" />
                <div className="border-2 border-dashed border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50 rounded-2xl p-10 text-center transition-all">
                  <FileText className="mx-auto mb-3 text-gray-300 group-hover:text-blue-500" size={40} />
                  <p className="text-sm font-semibold text-gray-600">
                    {file ? file.name : "Select Resume"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF or Text format</p>
                </div>
              </label>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Required Skills</h2>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (setRequiredSkills([...requiredSkills, newSkill]), setNewSkill(""))}
                  placeholder="e.g. Docker"
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map(s => (
                  <span key={s} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    {s}
                    <X size={12} className="cursor-pointer" onClick={() => setRequiredSkills(requiredSkills.filter(i => i !== s))} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main: Analysis */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl border border-gray-100 space-y-4">
                <Loader2 size={48} className="animate-spin text-blue-500" />
                <p className="text-gray-500 font-medium">Extracting professional skills...</p>
              </div>
            ) : extractedSkills.length > 0 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Score Card */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Compatibility</h3>
                      <div className="text-6xl font-black mt-2">{score}%</div>
                    </div>
                    <Trophy size={64} className="text-yellow-400 opacity-20" />
                  </div>
                  <div className="mt-8 h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-blue-500' : 'bg-red-500'}`} 
                      style={{ width: `${score}%` }} 
                    />
                  </div>
                  <p className="mt-4 text-sm text-gray-500 font-medium italic">
                    Matched {matched.length} out of {requiredSkills.length} key requirements.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Extracted Pill Cloud */}
                  <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Detected in Resume</h4>
                    <div className="flex flex-wrap gap-2">
                      {extractedSkills.map(s => (
                        <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Matching List */}
                  <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Skill Comparison</h4>
                    <div className="space-y-3">
                      {requiredSkills.map(req => {
                        const isMatch = matched.includes(req);
                        return (
                          <div key={req} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                            <span className={`text-sm font-bold ${isMatch ? 'text-gray-900' : 'text-gray-400'}`}>{req}</span>
                            {isMatch ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <X size={16} className="text-gray-300" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <FileText size={64} className="text-gray-100 mb-4" />
                <p className="text-gray-400 font-medium">No resume analyzed yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}