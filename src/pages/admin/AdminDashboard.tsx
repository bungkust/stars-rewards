import { useState } from 'react';
import { FaCheckDouble, FaClock, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import { useAppStore } from '../../store/useAppStore';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import RejectionReasonModal from '../../components/modals/RejectionReasonModal';
import VerificationSuccessModal from '../../components/modals/VerificationSuccessModal';
import StarAdjustmentModal from '../../components/modals/StarAdjustmentModal';

const AdminDashboard = () => {
  const { pendingVerifications, verifyTask, rejectTask, approveTaskException, manualAdjustment, children, isLoading } = useAppStore();

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<{ id: string, name: string, balance: number } | null>(null);
  const [successType, setSuccessType] = useState<'approve' | 'reject'>('approve');

  const verifications = pendingVerifications || [];

  const handleApprove = async (logId: string, childId: string, rewardValue: number) => {
    const { error } = await verifyTask(logId, childId, rewardValue);
    if (!error) {
      setSuccessType('approve');
      setSuccessModalOpen(true);
    }
  };

  const handleApproveException = async (logId: string) => {
    const { error } = await approveTaskException(logId);
    if (!error) {
      setSuccessType('approve');
      setSuccessModalOpen(true);
    }
  };

  const onRejectClick = (logId: string) => {
    setSelectedLogId(logId);
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (selectedLogId) {
      const { error } = await rejectTask(selectedLogId, reason);
      if (!error) {
        setRejectionModalOpen(false);
        setSelectedLogId(null);
        setSuccessType('reject');
        setSuccessModalOpen(true);
      }
    }
  };

  const openAdjustmentModal = (child: typeof children[0]) => {
    setSelectedChild({
      id: child.id,
      name: child.name,
      balance: child.current_balance
    });
    setAdjustmentModalOpen(true);
  };

  const handleAdjustment = async (amount: number, type: 'add' | 'deduct', reason: string) => {
    if (!selectedChild) return;

    // If deducting, make amount negative
    const finalAmount = type === 'deduct' ? -amount : amount;

    const { error } = await manualAdjustment(selectedChild.id, finalAmount, reason);

    if (!error) {
      setAdjustmentModalOpen(false);
      setSelectedChild(null);
    } else {
      alert('Failed to update balance');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <H1Header>Homepage</H1Header>
      </div>

      {/* Children Overview Section */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">My Children</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map(child => (
            <AppCard key={child.id} className="!p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={child.avatar_url} alt={child.name} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{child.name}</h3>
                  <p className="text-primary font-bold">{child.current_balance} Stars</p>
                </div>
              </div>
              <button
                className="btn btn-circle btn-ghost btn-sm text-gray-400 hover:text-primary"
                onClick={() => openAdjustmentModal(child)}
                title="Adjust Balance"
              >
                <FaEdit className="w-5 h-5" />
              </button>
            </AppCard>
          ))}
        </div>
      </section>

      <RejectionReasonModal
        isOpen={rejectionModalOpen}
        onClose={() => {
          setRejectionModalOpen(false);
          setSelectedLogId(null);
        }}
        onConfirm={handleConfirmReject}
        isLoading={isLoading}
      />

      <VerificationSuccessModal
        isOpen={successModalOpen}
        type={successType}
        onClose={() => setSuccessModalOpen(false)}
      />

      {selectedChild && (
        <StarAdjustmentModal
          isOpen={adjustmentModalOpen}
          childName={selectedChild.name}
          currentBalance={selectedChild.balance}
          onClose={() => {
            setAdjustmentModalOpen(false);
            setSelectedChild(null);
          }}
          onConfirm={handleAdjustment}
          isLoading={isLoading}
        />
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">Verification Center</h2>
        {verifications.length === 0 ? (
          <AppCard className="flex flex-col items-center justify-center py-12 text-center">
            <FaCheckDouble className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-600">All caught up!</h3>
            <p className="text-gray-500">No missions waiting for approval.</p>
          </AppCard>
        ) : (
          <div className="flex flex-col gap-3">
            {verifications.map((item) => {
              const isExcuse = item.status === 'PENDING_EXCUSE';

              return (
                <AppCard key={item.id} className="flex flex-row items-center justify-between !p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${isExcuse ? 'bg-orange-100 text-orange-600' : 'bg-warning/10 text-warning'}`}>
                      <FaClock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {item.task_title}
                        {isExcuse && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Exception Request</span>}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.child_name} • {isExcuse ? 'No Reward' : `Reward: ${item.reward_value} Stars`}
                      </p>
                      {isExcuse && item.notes && (
                        <p className="text-sm text-gray-700 mt-1 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-square btn-outline btn-error"
                      title="Reject"
                      onClick={() => onRejectClick(item.id)}
                      disabled={isLoading}
                    >
                      <FaTimes />
                    </button>
                    <button
                      className={`btn btn-sm btn-square text-white ${isExcuse ? 'btn-warning' : 'btn-success'}`}
                      title={isExcuse ? "Approve Exception" : "Approve"}
                      onClick={() => {
                        if (isExcuse) {
                          handleApproveException(item.id);
                        } else {
                          handleApprove(item.id, item.child_id, item.reward_value);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <FaCheck />
                    </button>
                  </div>
                </AppCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
