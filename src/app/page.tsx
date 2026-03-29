"use client";

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Trophy, Sparkles, Angry, Heart, Globe, Smile } from 'lucide-react';
import { toast } from "sonner";

const DEFAULT_REQUIRED = ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'];

export default function ResumeMatcherPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(DEFAULT_REQUIRED);
  const [newSkill, setNewSkill] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      toast.error("Invalid file type", {
        description: "Only PDF files are supported."
      });
      return;
    }

    setFile(selected);
    setLoading(true);

    const toastId = toast.loading("Analyzing resume...");

    try {
      const formData = new FormData();
      formData.append("file", selected);

      const response = await fetch("/api/extract-skills", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      if (!data.skills || data.skills.length === 0) {
        toast.warning("No skills found", {
          id: toastId,
          description: "No specific skills detected"
        });
        setExtractedSkills([]);
        return;
      }

      setExtractedSkills(data.skills);
      toast.success("Resume Analyzed", {
        id: toastId,
        description: `Extracted ${data.skills.length} skills`
      });
    } catch (err: any) {
      toast.error("Extraction Failed", {
        id: toastId,
        description: err.message || "Something went wrong"
      });
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

  const handleAddSkill = () => {
    if (!newSkill.trim()){
      toast.error("Skill cannot be empty");
      return;
    }
    if (requiredSkills.includes(newSkill.trim())) {
      toast.error("Duplicate Skill", { description: "This skill is already in your list." });
      return;
    }
    setRequiredSkills([...requiredSkills, newSkill.trim()]);
    setNewSkill("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <nav className="sticky top-4 z-50 mx-auto w-[82%] rounded-4xl bg-white/50 backdrop-blur-md border border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">
              SkillMatcher <span className="text-blue-600">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <a
              href="https://github.com/prodot-com"
              target="_blank"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
              title="GitHub Repository"
            >
              <img
                src="/github.svg"
                alt="GitHub"
                className="w-5 h-5"
              />
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-4 space-y-6">

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <Upload size={18} className="text-blue-500" />
                Upload Resume
              </h2>
              <label className="group relative block cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                <div className="border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/50 rounded-2xl p-8 text-center transition-all duration-300">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                    <FileText className="text-slate-400 group-hover:text-blue-600" size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {file ? file.name : "Drop resume here"}
                  </p>
                  {file && (
                    <p className="text-xs text-blue-500 font-semibold mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">Supports PDF</p>
                </div>
              </label>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Target Requirements</h2>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add required skill..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map(s => (
                  <span key={s} className="pl-3 pr-2 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 group">
                    {s}
                    <button onClick={() => setRequiredSkills(requiredSkills.filter(i => i !== s))} className="hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            {loading ? (
              <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
                  <Loader2 size={64} className="animate-spin text-blue-600 relative z-10" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-800">Analyzing Experience</p>
                  <p className="text-slate-400 text-sm">Gemini 1.5 is identifying technical skills...</p>
                </div>
              </div>
            ) : extractedSkills.length > 0 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Trophy size={200} />
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="text-center md:text-left">
                      <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Job Compatibility</h3>
                      <div className="text-8xl font-black tracking-tighter text-slate-900 leading-none">
                        {score}<span className="text-blue-600">%</span>
                      </div>
                      <p className="mt-6 text-slate-500 font-medium">
                        {matched.length} of {requiredSkills.length} skills matched —{" "}
                        <span className="text-slate-900 font-bold">{score}%</span>
                      </p>
                    </div>

                    <div className="w-full md:w-64 space-y-4">
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200/50">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${score > 70 ? 'bg-emerald-500' : score > 40 ? 'bg-blue-500' : 'bg-rose-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <span>Low Match</span>
                        <span>Perfect fit</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Extracted Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {extractedSkills.map(s => (
                        <span key={s} className="px-4 py-2 bg-blue-50/50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100/50 hover:bg-blue-100 transition-colors">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Requirement Match</h4>
                    <div className="space-y-3">
                      {requiredSkills.map(req => {
                        const isMatch = matched.includes(req);
                        return (
                          <div key={req} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isMatch ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                            <span className={`text-sm font-bold ${isMatch ? 'text-emerald-900' : 'text-slate-400'}`}>{req}</span>
                            {isMatch ? (
                              <div className="bg-emerald-500 p-1 rounded-full"><CheckCircle size={14} className="text-white" /></div>
                            ) : (
                              <X size={16} className="text-slate-300" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 group hover:border-blue-300 transition-colors">
                <div className="bg-slate-50 p-6 rounded-3xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  <FileText size={64} className="text-slate-200 group-hover:text-blue-200" />
                </div>
                <p className="text-slate-400 font-bold tracking-tight">Ready for Resume Analysis</p>
                <p className="text-slate-300 text-sm mt-1">Upload a file to see your compatibility score</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-12 px-4 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              <span className="font-black tracking-tight text-slate-900">SkillMatcher AI</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Empowering your career with AI-driven insights.</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a href="https://github.com/prodot-com" className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-black/15">
                <img
                  src="/github.svg"
                  alt="GitHub"
                  className="w-5 h-5"
                />
              </a>
              <a href="https://www.linkedin.com/in/ghoshprobal/" className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-black/15">
                <img
                  src="/linkedin.svg"
                  alt="GitHub"
                  className="w-5 h-5"
                />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              Made with <Heart size={12} className="text-rose-500 fill-rose-500" /> by <span className=''>PROBAL</span>
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-slate-500 font-medium">© {new Date().getFullYear()} SkillMatcher. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}