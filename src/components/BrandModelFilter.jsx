import { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";

function AutocompleteField({ label, items, value, onChange, onClear, placeholder }) {
  const [inputVal, setInputVal] = useState(value ? value.nom : "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setInputVal(value ? value.nom : "");
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = items.filter((item) =>
    item.nom.toLowerCase().includes(inputVal.toLowerCase())
  );

  const handleSelect = (item) => {
    setInputVal(item.nom);
    setOpen(false);
    onChange(item);
  };

  const handleClear = () => {
    setInputVal("");
    setOpen(false);
    onClear();
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-16 text-sm outline-none focus:border-blue-500"
        />
        <div className="absolute right-1 flex items-center gap-0.5">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 hover:text-red-500 text-gray-400 transition"
              title="Effacer"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1 text-gray-400 hover:text-blue-600 transition"
          >
            <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
          </button>
        </div>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item._id}
              onMouseDown={() => handleSelect(item)}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition ${
                value?._id === item._id ? "bg-blue-50 text-blue-700 font-medium" : ""
              }`}
            >
              {item.nom}
            </li>
          ))}
        </ul>
      )}
      {open && filtered.length === 0 && inputVal && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500">
          Aucun résultat
        </div>
      )}
    </div>
  );
}

export default function BrandModelFilter({
  marques,
  modeles,
  selectedMarque,
  selectedModele,
  onMarqueChange,
  onModeleChange,
}) {
  const filteredModeles = selectedMarque
    ? modeles.filter((m) => {
        const mid = m.marque?._id || m.marque;
        return String(mid) === String(selectedMarque._id);
      })
    : modeles;

  const handleModeleChange = (modele) => {
    onModeleChange(modele);
    if (modele && !selectedMarque) {
      const linkedMarque = marques.find((mk) => {
        const mid = modele.marque?._id || modele.marque;
        return String(mk._id) === String(mid);
      });
      if (linkedMarque) onMarqueChange(linkedMarque);
    }
  };

  return (
    <div className="space-y-4">
      <AutocompleteField
        label="Marque"
        items={marques}
        value={selectedMarque}
        onChange={onMarqueChange}
        onClear={() => { onMarqueChange(null); onModeleChange(null); }}
        placeholder="Rechercher une marque..."
      />
      <AutocompleteField
        label="Modèle"
        items={filteredModeles}
        value={selectedModele}
        onChange={handleModeleChange}
        onClear={() => onModeleChange(null)}
        placeholder={selectedMarque ? "Rechercher un modèle..." : "Tous les modèles..."}
      />
    </div>
  );
}
