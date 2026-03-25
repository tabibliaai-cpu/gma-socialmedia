'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Bot, Plus, Play, Pause, Trash2, MessageCircle, TrendingUp, Lightbulb, Save, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface Automation {
  id: string;
  type: 'auto_reply' | 'lead_followup' | 'deal_suggestion';
  trigger_event: string;
  prompt_template: string;
  is_active: boolean;
  created_at: string;
}

export default function AIAutomationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user?.role !== 'business') {
      router.push('/feed');
      return;
    }
    loadAutomations();
  }, [user]);

  const loadAutomations = async () => {
    try {
      const { data } = await aiAPI.getAutomations();
      setAutomations(data || []);
    } catch (error) {
      console.error('Failed to load automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (id: string, currentStatus: boolean) => {
    try {
      await aiAPI.toggleAutomation(id, !currentStatus);
      setAutomations(automations.map(a => 
        a.id === id ? { ...a, is_active: !currentStatus } : a
      ));
      toast.success(currentStatus ? 'Automation paused' : 'Automation activated');
    } catch (error) {
      toast.error('Failed to update automation');
    }
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm('Delete this automation?')) return;
    try {
      await aiAPI.deleteAutomation(id);
      setAutomations(automations.filter(a => a.id !== id));
      toast.success('Automation deleted');
    } catch (error) {
      toast.error('Failed to delete automation');
    }
  };

  const typeIcons = {
    auto_reply: MessageCircle,
    lead_followup: TrendingUp,
    deal_suggestion: Lightbulb,
  };

  const typeLabels = {
    auto_reply: 'Auto Reply',
    lead_followup: 'Lead Follow-up',
    deal_suggestion: 'Deal Suggestion',
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Bot className="h-7 w-7 mr-2 text-primary-400" />
              AI Automations
            </h1>
            <p className="text-gray-400">Automate your business with AI</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Automation</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-200 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Active Automations</p>
            <p className="text-2xl font-bold text-white">
              {automations.filter(a => a.is_active).length}
            </p>
          </div>
          <div className="bg-dark-200 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Messages Auto-Replied</p>
            <p className="text-2xl font-bold text-white">--</p>
          </div>
          <div className="bg-dark-200 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Time Saved</p>
            <p className="text-2xl font-bold text-white">--</p>
          </div>
        </div>

        {/* Automations List */}
        {automations.length === 0 ? (
          <div className="bg-dark-200 rounded-xl p-12 text-center">
            <Bot className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No automations yet</h3>
            <p className="text-gray-400 mb-4">
              Create AI automations to handle repetitive tasks automatically
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First Automation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {automations.map((automation) => {
              const Icon = typeIcons[automation.type];
              return (
                <div key={automation.id} className="bg-dark-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary-500/20 rounded-xl">
                        <Icon className="h-6 w-6 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{typeLabels[automation.type]}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Trigger: {automation.trigger_event}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {automation.prompt_template.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        automation.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {automation.is_active ? 'Active' : 'Paused'}
                      </span>
                      <button
                        onClick={() => toggleAutomation(automation.id, automation.is_active)}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        {automation.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteAutomation(automation.id)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateAutomationModal
            onClose={() => setShowCreateModal(false)}
            onCreated={loadAutomations}
          />
        )}
      </div>
    </div>
  );
}

function CreateAutomationModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState<'auto_reply' | 'lead_followup' | 'deal_suggestion'>('auto_reply');
  const [triggerEvent, setTriggerEvent] = useState('new_message');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await aiAPI.createAutomation({
        type,
        triggerEvent,
        promptTemplate,
      });
      toast.success('Automation created!');
      onCreated();
      onClose();
    } catch (error) {
      toast.error('Failed to create automation');
    } finally {
      setLoading(false);
    }
  };

  const promptSuggestions = {
    auto_reply: 'You are a helpful customer service assistant. Respond professionally and offer assistance.',
    lead_followup: 'Generate a friendly follow-up message for a potential customer who showed interest.',
    deal_suggestion: 'Analyze this deal and suggest the best next steps to close it.',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Create AI Automation</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Automation Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as any);
                setPromptTemplate(promptSuggestions[e.target.value as keyof typeof promptSuggestions]);
              }}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="auto_reply">Auto Reply to Messages</option>
              <option value="lead_followup">Lead Follow-up</option>
              <option value="deal_suggestion">Deal Suggestions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trigger Event</label>
            <input
              type="text"
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              placeholder="e.g., new_message, new_lead, deal_stage_change"
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">AI Prompt Template</label>
            <textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="Enter the instructions for the AI..."
              rows={6}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This prompt will be used to generate AI responses
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-dark-300 text-white rounded-lg hover:bg-dark-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-800"
            >
              {loading ? 'Creating...' : 'Create Automation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
