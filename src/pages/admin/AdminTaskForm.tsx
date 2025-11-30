import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft } from 'react-icons/fa';

const REPETITION_OPTIONS = ['Once', 'Daily', 'Weekly', 'Monthly'];

const AdminTaskForm = () => {
  const navigate = useNavigate();
  const { addTask, children } = useAppStore(); // Fixed: use addTask instead of addPendingTask

  const [title, setTitle] = useState('');
  const [reward, setReward] = useState(10);
  const [duration, setDuration] = useState(15);
  const [repetition, setRepetition] = useState('Once');
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map local form state to Task object schema for database
    // Note: The database schema for 'tasks' does not store 'childId' directly in the same way
    // because 'tasks' are templates. However, if the intention is to assign it, we might need
    // a separate assignment or just create the template. 
    // The current 'addTask' in store calls Supabase 'tasks' table which has parent_id.
    // For now, we will create the task template.
    
    await addTask({
      name: title,
      reward_value: Number(reward),
      type: repetition === 'Once' ? 'ONE_TIME' : 'RECURRING',
      recurrence_rule: repetition,
      is_active: true
    });
    
    navigate('/admin/tasks');
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
          <FaArrowLeft />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">New Mission</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Mission Title</span>
          </label>
          <input 
            type="text" 
            placeholder="e.g. Clean Room" 
            className="input input-bordered w-full rounded-xl" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Reward (Stars)</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered w-full rounded-xl" 
              value={reward}
              onChange={(e) => setReward(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Duration (Min)</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered w-full rounded-xl" 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={5}
              step={5}
            />
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Repetition</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {REPETITION_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setRepetition(opt)}
                className={`btn btn-sm rounded-full normal-case ${repetition === opt ? 'btn-primary text-white' : 'btn-outline border-gray-300 text-gray-600'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Assign To</span>
          </label>
          <select 
            className="select select-bordered w-full rounded-xl"
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary rounded-xl w-full mt-4 text-white font-bold text-lg shadow-md">
          Save Mission
        </button>
      </form>
    </div>
  );
};

export default AdminTaskForm;
