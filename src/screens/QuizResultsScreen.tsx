import React from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Home,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuizResultsScreen: React.FC = () => {
  const { latestQuizResult, startActivity, navigateTo } = useApp();

  if (!latestQuizResult) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <h1 className="font-display font-bold text-xl text-[#172554]">
          No Recent Quiz Results
        </h1>
        <p className="text-sm text-slate-600">
          Complete an interactive quiz or drag-and-drop challenge to view your detailed breakdown.
        </p>
        <button
          type="button"
          onClick={() => navigateTo('activities')}
          className="px-4 py-2.5 rounded-lg bg-[#172554] text-white text-xs font-semibold"
        >
          Browse Activities
        </button>
      </div>
    );
  }

  const {
    activityId,
    activityTitle,
    subject,
    scorePercent,
    correctCount,
    totalCount,
    durationSeconds,
    itemReviews,
  } = latestQuizResult;

  const feedbackTier =
    scorePercent >= 85
      ? {
          heading: 'Excellent Mastery',
          message:
            'Outstanding spatial and conceptual recall. Your Learning Progress and subject mastery have been updated.',
          color: 'text-emerald-700',
        }
      : scorePercent >= 60
        ? {
            heading: 'Good Progress',
            message:
              'Solid understanding! Review the explanations below or inspect the 3D model again before retrying.',
            color: 'text-[#3B82F6]',
          }
        : {
            heading: 'Keep Practicing',
            message:
              'Revisit the 3D labels and Virtual Classroom stations to reinforce these concepts, then retry for a higher score.',
            color: 'text-amber-700',
          };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Score Summary Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#3B82F6]">
              Activity Completed · {subject}
            </p>
            <h1 className="font-display font-bold text-2xl text-[#172554]">
              {activityTitle}
            </h1>
            <p className={`text-sm font-semibold ${feedbackTier.color}`}>
              {feedbackTier.heading}
            </p>
            <p className="text-xs text-slate-600 max-w-lg">{feedbackTier.message}</p>
          </div>

          <div className="bg-[#172554] text-white rounded-2xl px-6 py-5 text-center shrink-0">
            <p className="text-xs text-blue-200">Final Score</p>
            <p className="font-display font-extrabold text-4xl mt-1 tabular-nums">
              {scorePercent}%
            </p>
            <p className="text-xs text-blue-200 mt-1 tabular-nums">
              {correctCount}/{totalCount} correct · {durationSeconds}s
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => startActivity(activityId)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Activity</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('progress')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>View Learning Progress</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </section>

      {/* Answer Breakdown */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#8B5CF6]" />
          <h2 className="font-display font-bold text-base text-[#172554]">
            Answer Review & Explanations
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {itemReviews.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-1 last:pb-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  <span className="font-mono text-xs text-slate-400 mr-2">0{idx + 1}.</span>
                  {item.prompt}
                </p>
                {item.isCorrect ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    Correct
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 shrink-0">
                    <XCircle className="w-4 h-4" />
                    Incorrect
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                <span className="text-slate-600">
                  Your answer:{' '}
                  <strong className={item.isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                    {item.userAnswer}
                  </strong>
                </span>
                {!item.isCorrect && (
                  <span className="text-slate-600">
                    Correct answer: <strong className="text-emerald-700">{item.correctAnswer}</strong>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">{item.explanation}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
