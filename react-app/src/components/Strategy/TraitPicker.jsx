import { motion } from 'motion/react';
import { TRAITS_BY_DIMENSION } from '../../data/traits';
import { spring } from '../../styles/motion';

/*
  Grouped trait chips, reused for both the quiz's post-result suggestion
  (a couple of dimensions) and Strategy's own "+ Add a Trait" browser
  (all six) -- same interaction either way: tap an inactive trait to
  activate it as a Become Bucket, already-active ones just read as
  already-active, not tappable again.
*/
function TraitPicker({ dimensions, activeTraitNames, onActivate }) {
  return (
    <div className="trait-picker">
      {dimensions.map((dimension) => (
        <div className="trait-picker-group" key={dimension}>
          <span className="trait-picker-dimension">{dimension}</span>
          <div className="trait-chip-row">
            {TRAITS_BY_DIMENSION[dimension].map((trait) => {
              const isActive = activeTraitNames.has(trait);
              return (
                <motion.button
                  key={trait}
                  type="button"
                  className={`trait-chip${isActive ? ' is-active' : ''}`}
                  disabled={isActive}
                  onClick={() => onActivate(trait)}
                  whileHover={isActive ? undefined : { scale: 1.04, transition: spring.hover }}
                  whileTap={isActive ? undefined : { scale: 0.92, transition: spring.press }}
                >
                  {isActive ? `✓ ${trait}` : trait}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TraitPicker;
