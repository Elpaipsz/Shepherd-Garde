import { FloatingInput } from './FloatingInput';

export const DeliverySection = ({ formData, handleInputChange }: { formData: any, handleInputChange: any }) => {
    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold tracking-tight mb-2 text-[#1A1918]">Delivery</h2>
            
            <FloatingInput 
                id="country" 
                label="Country/Region" 
                type="select" 
                value={formData.country} 
                onChange={handleInputChange} 
                options={[
                    {value: 'US', label: 'United States'},
                    {value: 'UK', label: 'United Kingdom'},
                    {value: 'CA', label: 'Canada'},
                    {value: 'FR', label: 'France'},
                    {value: 'CO', label: 'Colombia'}
                ]}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FloatingInput id="firstName" label="First name" value={formData.firstName} onChange={handleInputChange} required />
                <FloatingInput id="lastName" label="Last name" value={formData.lastName} onChange={handleInputChange} required />
            </div>
            
            <FloatingInput id="address" label="Address" value={formData.address} onChange={handleInputChange} required />
            <FloatingInput id="apartment" label="Apartment, suite, etc. (optional)" value={formData.apartment} onChange={handleInputChange} />
            
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <FloatingInput id="city" label="City" value={formData.city} onChange={handleInputChange} required />
                </div>
                <div className="col-span-1">
                    <FloatingInput id="state" label="State" value={formData.state} onChange={handleInputChange} required />
                </div>
                <div className="col-span-1">
                    <FloatingInput id="zip" label="ZIP code" value={formData.zip} onChange={handleInputChange} required />
                </div>
            </div>
        </section>
    );
};
