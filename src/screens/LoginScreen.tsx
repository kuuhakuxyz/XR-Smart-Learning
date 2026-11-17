import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Box,
  Compass,
  GraduationCap,
  Layers,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSETS, DEMO_USERS } from '../data/mockData';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const { loginAsUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [imgError, setImgError] = useState(false);

  const filteredUsers = DEMO_USERS.filter((u) => u.role === selectedRole);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Clean 3-zone top header */}
      <header className="bg-white border-b border-slate-200 px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#172554] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-[#172554] tracking-tight whitespace-nowrap">
            XR Smart Learning
          </span>
        </div>

        <span className="hidden md:inline-block text-xs text-slate-500 whitespace-nowrap">
          High-Fidelity Alpha Prototype · Malaysian Secondary & University STEM
        </span>

        <button
          type="button"
          onClick={() => loginAsUser(filteredUsers[0].id)}
          className="px-4 py-2 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          Quick Demo Sign In
        </button>
      </header>

      {/* Main Split Showcase */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left: Role & Account Selection */}
        <section className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#3B82F6] tracking-wide">
              Interactive AR · 3D Models · Virtual Classrooms · LMS
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#172554] leading-tight text-balance">
              Spatial STEM learning for Malaysian classrooms
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Explore interactive 3D anatomical, molecular, astronomical, and geological models, enter guided virtual labs, and track syllabus mastery in real time.
            </p>
          </div>

          {/* Role Toggle (Functional Segmented Control) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700">
              Select Demo Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                  selectedRole === 'student'
                    ? 'bg-white text-[#172554] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Account</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                  selectedRole === 'teacher'
                    ? 'bg-white text-[#172554] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Teacher Account</span>
              </button>
            </div>
          </div>

          {/* Selectable Demo Accounts */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-700">
              Choose a demo profile to enter the workspace
            </p>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => loginAsUser(user.id)}
                  className="w-full text-left bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-[#3B82F6] rounded-xl p-4 shadow-xs transition-all flex items-center justify-between gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                        user.role === 'student' ? 'bg-[#3B82F6]' : 'bg-[#8B5CF6]'
                      }`}
                    >
                      {user.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm sm:text-base text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{user.levelOrDepartment}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.institution}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#172554] group-hover:text-[#3B82F6] shrink-0 whitespace-nowrap">
                    <span>Enter</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span>
              Demo environment: progress, quizzes, and assignments persist locally in your browser.
            </span>
          </div>
        </section>

        {/* Right: Visual Showcase + 5 Feature Summary */}
        <section className="lg:col-span-6 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="relative h-64 sm:h-72 lg:h-80 bg-[#172554] overflow-hidden">
            {!imgError ? (
              <img
                src={ASSETS.heroBanner}
                alt="Malaysian students exploring interactive holographic STEM models in a modern university lab"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#172554] to-[#3B82F6] flex items-center justify-center p-6 text-white">
                <GraduationCap className="w-16 h-16 opacity-80" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/30 to-transparent flex flex-col justify-end p-6">
              <p className="text-xs font-medium text-blue-200">
                KSSM Secondary & University Foundation Alignment
              </p>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white mt-1">
                Five integrated XR & assessment modules
              </h2>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-center">
            <div className="flex items-start gap-3">
              <Box className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">AR 3D Learning Materials</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  7 interactive 3D models with labels & simulated AR overlay.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Compass className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Virtual Classrooms</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  3 navigable 3D labs across Anatomy, Astronomy, and Earth Science.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Layers className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Interactive Activities</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multiple-choice quizzes & drag-and-drop organelle/planet matching.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Progress & Online LMS</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live analytics, badges, assignment submissions & quiz builder.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
