import React from 'react';
import { FaTimes, FaBuilding, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaMoneyCheckAlt, FaHashtag, FaTags, FaUniversity, FaFileInvoiceDollar, FaStickyNote } from 'react-icons/fa';

const DetailItem = ({ label, value, fullWidth = false }) => (
    <div className={`text-sm ${fullWidth ? 'col-span-2' : ''}`}>
        <p className="text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800 break-words">{value || 'N/A'}</p>
    </div>
);

const Section = ({ title, icon, children }) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-3">{icon}{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {children}
        </div>
    </div>
);

const VendorPreview = ({ vendorData, onClose }) => {
  const { 
    vendorName, email, phone, mobile, website,
    addressLine1, addressLine2, city, state, pinCode, country,
    gstin, pan, taxTreatment, tdsApplies, tdsPercentage,
    contactAddresses,
    vendorTags,
    bankName, accountNumber, ifscCode, accountHolderName, branchName, accountType,
    paymentTerms, priceList, fiscalPosition,
    notes, upiId
  } = vendorData;

  const fullAddress = [addressLine1, addressLine2, city, state, pinCode, country].filter(Boolean).join(',\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full relative m-4" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <FaTimes size={20} />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-2">
          {/* Header */}
          <header className="flex items-center pb-6 border-b mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6">
              <FaBuilding className="text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{vendorName || 'Vendor Profile'}</h1>
              <p className="text-gray-500 flex items-center gap-2">{email || 'No email provided'}</p>
            </div>
          </header>

          {/* Vendor Details */}
          <div className="space-y-8">

            <Section title="Vendor Information" icon={<FaUser className="text-gray-400" />}>
                <DetailItem label="Vendor Name" value={vendorName} />
                <DetailItem label="Email Address" value={email} />
                <DetailItem label="Phone Number" value={phone} />
                <DetailItem label="Mobile Number" value={mobile} />
            </Section>

            <Section title="Address Information" icon={<FaMapMarkerAlt className="text-gray-400" />}>
                <DetailItem label="Address" value={fullAddress} fullWidth={true} />
            </Section>

            <Section title="Compliance" icon={<FaFileInvoiceDollar className="text-gray-400" />}>
                <DetailItem label="GST Treatment" value={taxTreatment} />
                <DetailItem label="GSTIN" value={gstin} />
                <DetailItem label="PAN" value={pan} />
                <DetailItem label="TDS Applies" value={tdsApplies ? 'Yes' : 'No'} />
                {tdsApplies && <DetailItem label="TDS Percentage" value={`${tdsPercentage}%`} />}
            </Section>

            <Section title="Banking Information" icon={<FaUniversity className="text-gray-400" />}>
                <DetailItem label="Account Holder Name" value={accountHolderName} />
                <DetailItem label="Bank Name" value={bankName} />
                <DetailItem label="Account Type" value={accountType} />
                <DetailItem label="Account Number" value={accountNumber} />
                <DetailItem label="IFSC Code" value={ifscCode} />
                <DetailItem label="Branch Name" value={branchName} />
                <DetailItem label="UPI ID" value={upiId} />
            </Section>
            
            {contactAddresses && contactAddresses.length > 0 &&
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center gap-3"><FaUser className="text-gray-400" />Additional Contacts</h3>
                    <div className="space-y-4">
                    {contactAddresses.map((contact, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border text-sm grid grid-cols-3 gap-4">
                           <DetailItem label="Contact Name" value={contact.name}/>
                           <DetailItem label="Email" value={contact.email}/>
                           <DetailItem label="Phone" value={contact.phone}/>
                        </div>
                    ))}
                    </div>
                </div>
            }

            {vendorTags && vendorTags.length > 0 &&
                <div>
                     <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center gap-3"><FaTags className="text-gray-400" />Vendor Tags</h3>
                     <div className="flex flex-wrap gap-2">
                        {vendorTags.map(tag => (
                            <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                     </div>
                </div>
            }

            {notes &&
                 <div>
                     <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center gap-3"><FaStickyNote className="text-gray-400" />Internal Notes</h3>
                     <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg border">{notes}</p>
                </div>
            }
          </div>

          {/* Footer */}
          <footer className="text-center pt-8 mt-8 border-t text-xs text-gray-400">
              <p>This is a computer-generated document.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default VendorPreview; 