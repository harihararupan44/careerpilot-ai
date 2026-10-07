import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Send, Building2, Briefcase, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const GUIDANCE_TOPICS = [
  'DSA',
  'Resume',
  'Projects',
  'Technical Interview',
  'HR Interview',
  'Placement Preparation',
  'Career Planning'
];

export default function RequestGuidanceModal({ isOpen, onClose, person, onSubmitRequest }) {
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [selectedTopics, setSelectedTopics] = useState(['DSA', 'Placement Preparation']);
  const [message, setMessage] = useState(
    'Hi! I am preparing for software engineering placements. I would love to get your mentorship and guidance on resume and technical rounds.'
  );
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (person) {
      setTargetCompany(person.company || '');
      setTargetRole(person.role || '');
      setSelectedTopics(['DSA', 'Placement Preparation']);
    }
  }, [person]);

  if (!person) return null;

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !targetCompany.trim() || !targetRole.trim()) return;

    try {
      setIsSending(true);

      const newRequest = {
        mentorId: person.id || person._id || person.userId,
        mentorName: person.name,
        mentorRole: person.role || person.targetRole,
        mentorCompany: person.company || person.placementStatus,
        mentorAvatar: person.avatar,
        targetCompany,
        targetRole,
        topics: selectedTopics,
        message: message.trim()
      };

      if (onSubmitRequest) {
        await onSubmitRequest(newRequest);
      }
      onClose();
    } catch (err) {
      // Error handled by parent / context
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Guidance"
      subtitle={`Connect with ${person.name} (${person.role} @ ${person.company})`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mentor Info Snippet */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
          <img
            src={person.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={person.name}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-200"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
              {person.name}
            </h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 truncate">
              {person.role} @ {person.company}
            </p>
          </div>
        </div>

        {/* Target Company */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Company
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Amazon, Google, Microsoft, Zoho"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-slate-100"
              required
            />
          </div>
        </div>

        {/* Target Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Role
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Development Engineer, Frontend Developer"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-slate-100"
              required
            />
          </div>
        </div>

        {/* Guidance Topics */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Guidance Topics
          </label>
          <div className="flex flex-wrap gap-1.5">
            {GUIDANCE_TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Message
          </label>
          <div className="relative">
            <textarea
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a brief introduction and what specific guidance you are seeking..."
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 resize-none leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Sending...' : 'Send Request'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
