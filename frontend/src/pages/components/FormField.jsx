const FormField = ({ label, name, value, onChange, placeholder, type = "text", required, min, step }) => (
  <div className="field">
    <label>{label}</label>
    <input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} required={required} min={min} step={step} />
  </div>
);

export default FormField;
