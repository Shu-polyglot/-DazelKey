import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import OverviewPanel from './components/OverviewPanel';
import NextUpPanel from './components/NextUpPanel';
import AchievementsShelf from './components/Achievements/AchievementsShelf';
import CalendarPanel from './components/Calendar/CalendarPanel';
import BucketListPanel from './components/BucketList/BucketListPanel';
import IntentComposer from './components/Modals/IntentComposer';
import BucketDetailsModal from './components/Modals/BucketDetailsModal';
import OpeningExperience from './components/Onboarding/OpeningExperience';
import { useBuckets } from './hooks/useBuckets';
import { useOnboarding } from './hooks/useOnboarding';
import { transitions } from './styles/motion';
import './App.css';

function App() {
  const { buckets, addBucket, updateBucket, deleteBucket, completeBucket } = useBuckets();
  const { isOnboarded, completeOnboarding } = useOnboarding();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailsBucketId, setDetailsBucketId] = useState(null);

  const detailsBucket = buckets.find((bucket) => bucket.id === detailsBucketId) || null;

  return (
    <>
      <AnimatePresence>
        {!isOnboarded && <OpeningExperience key="onboarding" onComplete={completeOnboarding} />}
      </AnimatePresence>

      {isOnboarded && (
        <motion.div
          className="page-shell"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.emphasis}
        >
          <Header title="Life OS" onAddBucket={() => setIsAddModalOpen(true)} />

          <main className="main-layout">
            <OverviewPanel buckets={buckets} />
            <NextUpPanel buckets={buckets} onOpenBucket={setDetailsBucketId} />
          </main>

          <AchievementsShelf buckets={buckets} onOpenBucket={setDetailsBucketId} />
          <CalendarPanel buckets={buckets} onOpenBucket={setDetailsBucketId} />
          <BucketListPanel buckets={buckets} onOpenBucket={setDetailsBucketId} />

          <AnimatePresence>
            {isAddModalOpen && (
              <IntentComposer key="add-modal" onClose={() => setIsAddModalOpen(false)} onAdd={addBucket} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {detailsBucket && (
              <BucketDetailsModal
                key={detailsBucket.id}
                bucket={detailsBucket}
                onClose={() => setDetailsBucketId(null)}
                onUpdate={updateBucket}
                onDelete={(id) => {
                  deleteBucket(id);
                  setDetailsBucketId(null);
                }}
                onComplete={completeBucket}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}

export default App;
