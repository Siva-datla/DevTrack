import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Trophy,
  Terminal,
} from 'lucide-react';
import submissionsApi from '../../api/submissions';
import { useToast } from '../../context/ToastContext';

const verdictConfig = {
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    icon: CheckCircle2,
  },
  OK: {
    label: 'Accepted',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    icon: CheckCircle2,
  },
  WRONG_ANSWER: {
    label: 'Wrong Answer',
    bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    icon: XCircle,
  },
  TIME_LIMIT_EXCEEDED: {
    label: 'Time Limit Exceeded (TLE)',
    bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    icon: Clock,
  },
  MEMORY_LIMIT_EXCEEDED: {
    label: 'Memory Limit Exceeded (MLE)',
    bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    icon: Clock,
  },
  RUNTIME_ERROR: {
    label: 'Runtime Error',
    bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    icon: AlertCircle,
  },
  COMPILATION_ERROR: {
    label: 'Compilation Error',
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: AlertCircle,
  },
};

const platformBadge = {
  LEETCODE: { label: 'LeetCode', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
  CODEFORCES: { label: 'Codeforces', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' },
  HACKERRANK: { label: 'HackerRank', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
};

const difficultyBadge = {
  EASY: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  HARD: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
  UNRATED: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

export const SubmissionDetailModal = ({ submissionId, initialData, isOpen, onClose }) => {
  const [submission, setSubmission] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setSubmission(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    // Fetch full submission data from API
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await submissionsApi.getSubmissionById(submissionId);
        if (res.success && res.data) {
          setSubmission(res.data);
        }
      } catch (err) {
        console.error('Error loading submission details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, submissionId]);

  if (!isOpen || !submission) return null;

  const verdict = verdictConfig[submission.verdict] || {
    label: submission.verdict || 'Unknown',
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: Clock,
  };
  const VerdictIcon = verdict.icon;

  const pBadge = platformBadge[submission.platform] || {
    label: submission.platform,
    color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };

  const dBadge = difficultyBadge[submission.difficulty] || difficultyBadge.UNRATED;

  const handleCopyId = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Submission ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pBadge.color}`}>
                {pBadge.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${verdict.bg}`}>
                <VerdictIcon className="w-3 h-3" />
                {verdict.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${dBadge}`}>
                {submission.difficulty || 'UNRATED'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {submission.problemName || submission.problemId || 'Submission Record'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 text-xs">
          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Platform Submission ID */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Platform ID
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {submission.platformSubmissionId || submission._id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyId(submission.platformSubmissionId || submission._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Copy ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Language */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Language
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {submission.language || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Submitted At */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Timestamp
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '—'}
                </span>
              </div>
            </div>

            {/* Contest ID if any */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Contest
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {submission.contestId ? `Contest #${submission.contestId}` : 'Practice / Gym'}
                </span>
              </div>
            </div>
          </div>

          {/* Problem Info Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Canonical Problem
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {submission.problemName || submission.problemId}
            </div>
            <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Identifier: {submission.problemId}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailModal;
