import { FaPlus, FaTimes, FaBan } from "react-icons/fa";

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ImagePicker = ({ label, value, onChange, presets, hint }) => {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) onChange(await toBase64(file));
  };

  return (
    <div className="field form-full">
      {label && <label className="image-picker-label-text">{label}</label>}
      <div className="image-picker-row">
        {!value && (
          <label className="image-picker-plus-btn">
            <FaPlus size={18} />
            <input type="file" accept="image/*" className="hidden-input" onChange={handleFile} />
          </label>
        )}
        {value && (
          <div className="image-picker-preview-wrap">
            <img src={value} alt="Preview" className="image-picker-preview" />
            <button type="button" onClick={() => onChange("")} className="image-picker-clear-btn"><FaTimes size={10} /></button>
          </div>
        )}
        {presets && (
          <div className="image-picker-presets">
            {presets.map(p => (
              <button key={p.value} type="button" onClick={() => onChange(p.value)}
                className={`image-picker-preset-btn${value === p.value ? " selected" : ""}`}>
                {p.preview
                  ? <img src={p.preview} alt={p.label} className="image-picker-preset-img" />
                  : <div className="image-picker-none-placeholder"><FaBan size={18} color="#6e6c8a" /><span className="image-picker-none-label">None</span></div>}
              </button>
            ))}
          </div>
        )}
      </div>
      {hint && <p className="image-picker-hint ip-hint-gap">{hint}</p>}
    </div>
  );
};

export default ImagePicker;
