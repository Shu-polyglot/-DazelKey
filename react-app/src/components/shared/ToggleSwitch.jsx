import './ToggleSwitch.css';

/*
  A plain on/off pill switch -- no motion dependency, matching the
  handful of other plain CSS-transition controls in this app (icon-
  button, social-link-add-button) rather than every control reaching
  for Framer Motion. `aria-checked`/role="switch" is what actually
  carries the on/off state to assistive tech; the knob position is
  purely decorative on top of that.
*/
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle-switch${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch-knob" />
    </button>
  );
}

export default ToggleSwitch;
