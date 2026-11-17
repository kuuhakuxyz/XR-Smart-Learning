import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GripVertical,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuizAttemptResult } from '../types';

export const QuizPlayerScreen: React.FC = () => {
  const {
    activities,
    selectedActivityId,
    navigateTo,
    completeActivityAttempt,
    openConfirm,
  } = useApp();

  const activity = activities.find((a) => a.id === selectedActivityId) ?? activities[0];
  const startedAtRef = useRef<number>(Date.now());

  // Multiple-choice state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submittedCurrent, setSubmittedCurrent] = useState(false);
  const [mcqReviews, setMcqReviews] = useState<QuizAttemptResult['itemReviews']>([]);

  // Drag-and-drop / Tap-to-match state
  const pairs = activity.matchingPairs ?? [];
  const shuffledTerms = useMemo(() => {
    const arr = pairs.map((p) => p.term);
    // Deterministic stable shuffle so terms don't line up 1-to-1 initially
    return arr.slice(1).concat(arr.slice(0, 1));
  }, [pairs]);

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activeTapTerm, setActiveTapTerm] = useState<string | null>(null);
  const [draggedTerm, setDraggedTerm] = useState<string | null>(null);
  const [matchingSubmitted, setMatchingSubmitted] = useState(false);

  const handleBack = () => {
    const hasProgress =
      mcqReviews.length > 0 || Object.keys(assignments).length > 0;
    if (hasProgress && !matchingSubmitted) {
      openConfirm(
        'Leave Current Activity?',
        'Your current answers will not be saved until you finish the activity.',
        'Leave Activity',
        () => navigateTo('activities'),
      );
    } else {
      navigateTo('activities');
    }
  };

  // --- Multiple-Choice Handlers ---
  const questions = activity.questions ?? [];
  const currentQ = questions[questionIndex];

  const handleSubmitMCQ = () => {
    if (selectedOption === null || !currentQ) return;
    const isCorrect = selectedOption === currentQ.correctIndex;
    const review = {
      prompt: currentQ.prompt,
      userAnswer: currentQ.options[selectedOption],
      correctAnswer: currentQ.options[currentQ.correctIndex],
      isCorrect,
      explanation: currentQ.explanation,
    };
    setMcqReviews((prev) => [...prev, review]);
    setSubmittedCurrent(true);
  };

  const handleNextMCQ = () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1);
      setSelectedOption(null);
      setSubmittedCurrent(false);
    } else {
      const correctCount = mcqReviews.filter((r) => r.isCorrect).length;
      const totalCount = questions.length;
      const scorePercent = Math.round((correctCount / Math.max(1, totalCount)) * 100);
      completeActivityAttempt({
        activityId: activity.id,
        activityTitle: activity.title,
        subject: activity.subject,
        type: activity.type,
        scorePercent,
        correctCount,
        totalCount,
        durationSeconds: Math.max(10, Math.round((Date.now() - startedAtRef.current) / 1000)),
        completedAt: 'Just now',
        itemReviews: mcqReviews,
      });
    }
  };

  // --- Drag-and-Drop / Tap Matching Handlers ---
  const usedTerms = Object.values(assignments);
  const availableTerms = shuffledTerms.filter((t) => !usedTerms.includes(t));

  const assignTermToPair = (pairId: string, term: string) => {
    if (matchingSubmitted) return;
    setAssignments((prev) => {
      const next = { ...prev };
      // Remove term if previously assigned elsewhere
      Object.keys(next).forEach((k) => {
        if (next[k] === term) delete next[k];
      });
      next[pairId] = term;
      return next;
    });
    setActiveTapTerm(null);
    setDraggedTerm(null);
  };

  const clearPair = (pairId: string) => {
    if (matchingSubmitted) return;
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[pairId];
      return next;
    });
  };

  const handleCheckMatches = () => {
    setMatchingSubmitted(true);
  };

  const handleFinishMatching = () => {
    const reviews: QuizAttemptResult['itemReviews'] = pairs.map((p) => {
      const chosen = assignments[p.id] ?? 'Unanswered';
      return {
        prompt: p.matchLabel,
        userAnswer: chosen,
        correctAnswer: p.term,
        isCorrect: chosen === p.term,
        explanation: p.explanation,
      };
    });
    const correctCount = reviews.filter((r) => r.isCorrect).length;
    const totalCount = pairs.length;
    const scorePercent = Math.round((correctCount / Math.max(1, totalCount)) * 100);

    completeActivityAttempt({
      activityId: activity.id,
      activityTitle: activity.title,
      subject: activity.subject,
      type: activity.type,
      scorePercent,
      correctCount,
      totalCount,
      durationSeconds: Math.max(10, Math.round((Date.now() - startedAtRef.current) / 1000)),
      completedAt: 'Just now',
      itemReviews: reviews,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Activities</span>
        </button>

        <span className="text-xs font-medium text-slate-500">
          {activity.subject} · {activity.difficulty}
        </span>
      </div>

      {/* Multiple Choice Quiz Mode */}
      {activity.type === 'quiz' && currentQ && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#3B82F6]">{activity.title}</span>
              <span className="font-mono text-slate-500 tabular-nums">
                Question {questionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="font-display font-bold text-lg sm:text-xl text-[#172554] leading-snug">
            {currentQ.prompt}
          </h1>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isRightOption = idx === currentQ.correctIndex;

              let btnStyle =
                'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
              if (submittedCurrent) {
                if (isRightOption) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                } else if (isSelected && !isRightOption) {
                  btnStyle = 'border-red-400 bg-red-50 text-red-900';
                } else {
                  btnStyle = 'border-slate-200 bg-slate-50 text-slate-500';
                }
              } else if (isSelected) {
                btnStyle = 'border-[#3B82F6] bg-blue-50/70 text-[#172554]';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={submittedCurrent}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-colors flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {submittedCurrent && isRightOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {submittedCurrent && isSelected && !isRightOption && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Feedback Banner */}
          {submittedCurrent && (
            <div
              className={`rounded-xl border p-4 text-xs space-y-1 ${
                selectedOption === currentQ.correctIndex
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                {selectedOption === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct Answer</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Incorrect — Correct Answer: {currentQ.options[currentQ.correctIndex]}</span>
                  </>
                )}
              </p>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!submittedCurrent ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleSubmitMCQ}
                className="px-5 py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextMCQ}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                <span>
                  {questionIndex + 1 < questions.length ? 'Next Question' : 'View Final Score'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      )}

      {/* Drag-and-Drop / Tap-to-Match Activity Mode */}
      {activity.type === 'matching' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#8B5CF6]">
              Drag & Drop (or Tap Term then Tap Target Slot)
            </p>
            <h1 className="font-display font-bold text-xl text-[#172554]">{activity.title}</h1>
            <p className="text-xs text-slate-600">{activity.description}</p>
          </div>

          {/* Available Draggable Terms Bank */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">
                Available Terms ({availableTerms.length} remaining)
              </p>
              {!matchingSubmitted && Object.keys(assignments).length > 0 && (
                <button
                  type="button"
                  onClick={() => setAssignments({})}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {availableTerms.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium">
                All terms placed! Click "Check Answers" below to review.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTerms.map((term) => {
                  const selected = activeTapTerm === term;
                  return (
                    <button
                      key={term}
                      type="button"
                      draggable={!matchingSubmitted}
                      onDragStart={() => setDraggedTerm(term)}
                      onClick={() => setActiveTapTerm(selected ? null : term)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-grab active:cursor-grabbing transition-colors ${
                        selected
                          ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                          : 'bg-white text-[#172554] border-slate-300 hover:border-[#3B82F6]'
                      }`}
                    >
                      <GripVertical className="w-3.5 h-3.5 opacity-60" />
                      <span>{term}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Target Drop Slots */}
          <div className="space-y-3">
            {pairs.map((pair, idx) => {
              const placed = assignments[pair.id];
              const isCorrect = placed === pair.term;

              return (
                <div
                  key={pair.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedTerm) assignTermToPair(pair.id, draggedTerm);
                  }}
                  onClick={() => {
                    if (activeTapTerm) assignTermToPair(pair.id, activeTapTerm);
                  }}
                  className={`rounded-xl border p-4 transition-colors ${
                    matchingSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-red-50 border-red-300'
                      : activeTapTerm
                        ? 'border-blue-400 bg-blue-50/30 cursor-pointer'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="text-[11px] font-mono text-slate-400">Item 0{idx + 1}</p>
                      <p className="text-sm font-medium text-slate-800">{pair.matchLabel}</p>
                    </div>

                    <div className="sm:w-52 shrink-0 flex items-center justify-end gap-2">
                      {placed ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                              matchingSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-red-600 text-white border-red-600'
                                : 'bg-[#172554] text-white border-[#172554]'
                            }`}
                          >
                            {placed}
                          </span>
                          {!matchingSubmitted && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearPair(pair.id);
                              }}
                              className="text-xs text-slate-500 hover:text-red-600 underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-400">
                          {activeTapTerm ? `Tap to place "${activeTapTerm}"` : 'Drop term here'}
                        </div>
                      )}
                    </div>
                  </div>

                  {matchingSubmitted && (
                    <p className="text-xs mt-2.5 pt-2 border-t border-black/10 text-slate-700">
                      {!isCorrect && (
                        <span className="font-bold text-red-700 mr-1.5">
                          Correct match: {pair.term}.
                        </span>
                      )}
                      {pair.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {!matchingSubmitted ? (
              <button
                type="button"
                disabled={Object.keys(assignments).length < pairs.length}
                onClick={handleCheckMatches}
                className="px-5 py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors"
              >
                Check Answers ({Object.keys(assignments).length}/{pairs.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishMatching}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                <span>Complete & Record Score</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
