export const FloatingInput = ({ 
    id, label, type = "text", value, onChange, required = false, placeholder = "", options = [] 
}: { 
    id: string, label: string, type?: string, value: string, onChange: (e: any) => void, required?: boolean, placeholder?: string, options?: {value: string, label: string}[] 
}) => {
    const isFloating = value.length > 0;
    
    if (type === 'select') {
        return (
            <div className="relative mb-4">
                <select 
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full h-[56px] pt-[24px] px-[16px] pb-[8px] bg-[#FDFBF7] border border-[#E6E4DF] rounded-xl text-[15px] text-[#2D2B2A] outline-none transition-all focus:border-[#1A1918] focus:ring-1 focus:ring-[#1A1918] appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%232D2B2A%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat' }}
                >
                    <option value="" disabled hidden></option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <label 
                    htmlFor={id}
                    className={`absolute left-[16px] pointer-events-none transition-all origin-top-left ${isFloating ? 'top-[8px] text-[12px] text-[#1A1918]' : 'top-[18px] text-[15px] text-[#C2BDB5]'}`}
                >
                    {label}
                </label>
            </div>
        )
    }

    return (
        <div className="relative mb-4">
            <input 
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="peer w-full h-[56px] pt-[24px] px-[16px] pb-[8px] bg-[#FDFBF7] border border-[#E6E4DF] rounded-xl text-[15px] text-[#2D2B2A] outline-none transition-all focus:border-[#1A1918] focus:ring-1 focus:ring-[#1A1918]"
            />
            <label 
                htmlFor={id}
                className={`absolute left-[16px] pointer-events-none transition-all origin-top-left ${isFloating ? 'top-[8px] text-[12px] text-[#1A1918]' : 'top-[18px] text-[15px] text-[#C2BDB5] peer-focus:top-[8px] peer-focus:text-[12px] peer-focus:text-[#1A1918]'}`}
            >
                {label}
            </label>
            {id === 'cardNumber' && (
                <div className="absolute right-4 top-4 text-[#C2BDB5]">
                    <span className="material-symbols-outlined">credit_card</span>
                </div>
            )}
            {id === 'cvc' && (
                <div className="absolute right-4 top-4 text-[#C2BDB5] cursor-help" title="3 digits on back of card">
                    <span className="material-symbols-outlined text-[18px]">help</span>
                </div>
            )}
        </div>
    )
}
