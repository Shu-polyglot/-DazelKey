import { useState } from 'react';
import { motion } from 'motion/react';
import { spring } from '../../styles/motion';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  Habit registration for one goal: text input + add button + list +
  delete, the same shape AddPriorityFlow's old milestones step used --
  just inline in GoalDetail instead of its own modal step, since a
  habit is registered any time after the goal exists, not just at
  creation. No cap (unlike the old milestones list).
*/
function AddHabitForm({ habits, onAdd, onDelete, readOnly = false }) {
  const [name, setName] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    onAdd(trimmed);
    setName('');
  }

  return (
    <div className="add-habit-form">
      {habits.length > 0 && (
        <div className="add-habit-list">
          {habits.map((habit) => (
            <div className="add-habit-list-item" key={habit.id}>
              <span>{habit.name}</span>
              {!readOnly && (
                <button type="button" className="icon-button" aria-label={`Remove ${habit.name}`} onClick={() => onDelete(habit.id)}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <div className="add-habit-input-row">
          <input
            type="text"
            className="step-editor-field-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder="習慣を入力"
          />
          <motion.button type="button" className="secondary-button" onClick={handleAdd} {...tapProps}>
            + Add
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default AddHabitForm;
