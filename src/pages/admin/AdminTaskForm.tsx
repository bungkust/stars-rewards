import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { AlertModal } from '../../components/design-system';

const REPETITION_OPTIONS = ['Once', 'Daily', 'Weekly', 'Monthly'];

const AdminTaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get task ID from URL if editing
  const { addTask, updateTask, tasks, children } = useAppStore();

  const [title, setTitle] = useState('');
  const [reward, setReward] = useState(10);
  const [duration, setDuration] = useState(15);
  const [repetition, setRepetition] = useState('Once');
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || '');
  const [isActive, setIsActive] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Load existing task if editing
  useEffect(() => {
    if (id) {
      const taskToEdit = tasks.find(t => t.id === id);
      if (taskToEdit) {
        setTitle(taskToEdit.name);
        setReward(taskToEdit.reward_value);
        setRepetition(taskToEdit.recurrence_rule || 'Once');
        setIsActive(taskToEdit.is_active !== false);
      }
    }
  }, [id, tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      name: title,
      reward_value: Number(reward),
      type: repetition === 'Once' ? 'ONE_TIME' : 'RECURRING' as const,
      recurrence_rule: repetition,
      is_active: isActive
    };

    if (id) {
      await updateTask(id, taskData);
    } else {
      await addTask(taskData);
    }
    
    navigate('/admin/tasks');
  };

  const handleDelete = async () => {
    if (id) {
      await updateTask(id, { is_active: false });
      navigate('/admin/tasks');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
          <FaArrowLeft />
        </button>
          <h2 className="text-2xl font-bold text-gray-800">{id ? 'Edit Mission' : 'New Mission'}</h2>
        </div>
        {id && (
          <button onClick={() => setIsDeleteModalOpen(true)} className="btn btn-ghost btn-circle text-error">
            <FaTrash />
          </button>
        )}
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
          {id ? 'Update Mission' : 'Save Mission'}
        </button>
      </form>

      <AlertModal
        isOpen={isDeleteModalOpen}
        title="Delete Mission"
        message="Are you sure you want to delete (archive) this mission?"
        confirmText="Delete"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminTaskForm;
