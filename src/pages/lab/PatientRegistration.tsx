import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  UserPlus, 
  ArrowLeft, 
  Receipt, 
  FileText, 
  Calculator, 
  X, 
  Check, 
  ChevronsUpDown, 
  ChevronDown, 
  Loader2 
} from 'lucide-react';
import { demoTests } from '@/data/demoData';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { addPatient } from '@/services/patientService';
import { PdfLetterhead } from '@/components/print/PdfLetterhead';
import { InvoiceTemplate } from '@/components/billing/InvoiceTemplates';

type Gender = 'Male' | 'Female' | 'Other';

interface PatientForm {
  name: string;
  age: string;
  dob: string;
  gender: Gender | '';
  phone: string;
  doctor: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  selectedTests: string[];
  registrationDate: Date;
}

// Indian states and cities data
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const cityByState: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati'],
  'Delhi': ['New Delhi', 'Delhi Cantonment', 'Narela', 'Najafgarh'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Gulbarga'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Allahabad'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Arrah', 'Begusarai',
    'Chhapra', 'Katihar', 'Munger', 'Purnia', 'Saharsa', 'Sasaram', 'Hajipur',
    'Siwan', 'Samastipur', 'Motihari', 'Bettiah', 'Dehri', 'Nawada', 'Bagaha',
    'Buxar', 'Kishanganj', 'Sitamarhi', 'Jamalpur', 'Jehanabad', 'Aurangabad',
    'Biharsharif', 'Lakhisarai', 'Jamui', 'Araria', 'Madhepura', 'Supaul',
    'Sheikhpura', 'Sheohar', 'Arwal', 'Banka', 'Khagaria', 'Madhubani',
    'Saharsa', 'Supaul', 'Vaishali'
  ]
};

// Add remaining states with empty arrays if needed
indianStates.forEach(state => {
  if (!cityByState[state]) {
    cityByState[state] = [];
  }
});

// Function to generate patient ID in format SWT-YYMMDD-COUNT
const generatePatientId = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Get or initialize the count for today
  const countKey = `patientCount_${dateStr}`;
  let count = parseInt(localStorage.getItem(countKey) || '0', 10) + 1;
  localStorage.setItem(countKey, count.toString());
  
  return `SWT-${dateStr}-${String(count).padStart(2, '0')}`;
};

const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState(''); // SWT-YYMMDD-XX format ID
  const [patientDocId, setPatientDocId] = useState(''); // Firestore document ID
  
  // Generate patient ID on component mount
  useEffect(() => {
    setPatientId(generatePatientId());
  }, []);
  
  const [patient, setPatient] = useState<PatientForm>({
    name: '',
    age: '',
    dob: '',
    gender: '',
    phone: '',
    doctor: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    selectedTests: [],
    registrationDate: new Date()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample data for quick fill
  const firstNames = ['Aarav', 'Vihaan', 'Aaradhya', 'Diya', 'Advait', 'Ananya', 'Ishaan', 'Aanya', 'Vivaan', 'Anaya', 'Reyansh', 'Saanvi', 'Mohammed', 'Sai', 'Myra', 'Aarush', 'Aadhya', 'Ishita', 'Kabir', 'Anika'];
  const lastNames = ['Patel', 'Shah', 'Kumar', 'Sharma', 'Singh', 'Gupta', 'Verma', 'Yadav', 'Jain', 'Mehta', 'Reddy', 'Naidu', 'Nair', 'Menon', 'Pillai', 'Iyengar', 'Agarwal', 'Mishra', 'Trivedi', 'Joshi'];
  const cityList = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore', 'Thane', 'Bhopal', 'Patna', 'Vadodara', 'Ghaziabad'];
  const streets = ['MG Road', 'Bannerghatta Road', 'Juhu Tara Road', 'Brigade Road', 'Park Street', 'Marine Drive', 'Connaught Place', 'Jubilee Hills', 'Koregaon Park', 'Baner Road'];
  const doctors = ['Dr. Sharma', 'Dr. Patel', 'Dr. Gupta', 'Dr. Reddy', 'Dr. Kapoor', 'Dr. Malhotra', 'Dr. Choudhary', 'Dr. Iyer', 'Dr. Nair', 'Dr. Desai'];
  const stateList = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan'];

  // Generate random date of birth (between 18-80 years ago)
  const getRandomDOB = () => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - Math.floor(Math.random() * 62 + 18);
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${birthYear}-${birthMonth}-${birthDay}`;
  };

  // Generate random phone number
  const getRandomPhone = () => {
    return '9' + Math.floor(100000000 + Math.random() * 900000000);
  };

  // Quick fill function for testing (Ctrl+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        
        const gender = Math.random() > 0.5 ? 'Male' : 'Female';
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const city = cityList[Math.floor(Math.random() * cityList.length)];
        const state = stateList[Math.floor(Math.random() * stateList.length)];
        const street = streets[Math.floor(Math.random() * streets.length)];
        const houseNumber = Math.floor(Math.random() * 200) + 1;
        const pincode = Math.floor(400000 + Math.random() * 100000);
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const dob = getRandomDOB();
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        
        // Available test IDs from the test data
        const allTestIds = demoTests.map(test => test.id);
        const selectedTests = [];
        
        // Select 1-4 random tests
        const numTests = Math.min(Math.floor(Math.random() * 4) + 1, allTestIds.length);
        const testIndices = new Set<number>();
        
        while (testIndices.size < numTests) {
          testIndices.add(Math.floor(Math.random() * allTestIds.length));
        }
        
        testIndices.forEach(index => {
          selectedTests.push(allTestIds[index]);
        });

        // Update form fields with random data
        setPatient(prev => ({
          ...prev,
          name: `${firstName} ${lastName}`,
          age: age.toString(),
          gender: gender,
          phone: getRandomPhone(),
          doctor: doctor,
          address: `${houseNumber}, ${street}`,
          city: city,
          state: state,
          pincode: pincode.toString(),
          selectedTests: selectedTests,
          dob: dob
        }));

        // Update date input fields
        const [year, month, day] = dob.split('-');
        setTimeout(() => {
          const dayInput = document.getElementById('day') as HTMLInputElement;
          const monthInput = document.getElementById('month') as HTMLInputElement;
          const yearInput = document.getElementById('year') as HTMLInputElement;
          
          if (dayInput) dayInput.value = day;
          if (monthInput) monthInput.value = month;
          if (yearInput) yearInput.value = year;
        }, 100);

        // Trigger toast notification
        toast({
          title: 'Test Data Loaded',
          description: `Form filled with random data for ${firstName} ${lastName}`,
          variant: 'default',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [demoTests, firstNames, lastNames, cityList, stateList, streets, doctors]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update cities when state changes
  useEffect(() => {
    if (patient.state) {
      setCities(cityByState[patient.state] || []);
      setPatient(prev => ({ ...prev, city: '' }));
    }
  }, [patient.state]);

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const isDobEmpty = () => {
    const day = (document.getElementById('day') as HTMLInputElement)?.value;
    const month = (document.getElementById('month') as HTMLInputElement)?.value;
    const year = (document.getElementById('year') as HTMLInputElement)?.value;
    return !day && !month && !year;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Skip handling for date parts as they are handled by onBlur
    if (['day', 'month', 'year'].includes(name)) {
      return;
    }
    
    // If age is being updated and DOB is empty, allow manual entry
    if (name === 'age' && (isDobEmpty() || !patient.dob)) {
      setPatient(prev => ({
        ...prev,
        [name]: value,
        dob: '' // Clear DOB when age is manually entered
      }));
      return;
    }
    
    setPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof PatientForm, value: string) => {
    setPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestSelection = (testId: string, checked: boolean) => {
    setPatient(prev => ({
      ...prev,
      selectedTests: checked 
        ? [...prev.selectedTests, testId]
        : prev.selectedTests.filter(id => id !== testId)
    }));
  };

  const calculateTotal = () => {
    return patient.selectedTests.reduce((total, testId) => {
      const test = demoTests.find(t => t.id === testId);
      return total + (test?.price || 0);
    }, 0);
  };

  const resetForm = () => {
    setPatient({
      name: '',
      age: '',
      dob: '',
      gender: '',
      phone: '',
      doctor: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      selectedTests: [],
      registrationDate: new Date()
    });
    // Reset date inputs
    const dayInput = document.getElementById('day') as HTMLInputElement;
    const monthInput = document.getElementById('month') as HTMLInputElement;
    const yearInput = document.getElementById('year') as HTMLInputElement;
    if (dayInput) dayInput.value = '';
    if (monthInput) monthInput.value = '';
    if (yearInput) yearInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent, isBillGenerate: boolean = false) => {
    e.preventDefault();
    
    if (!isBillGenerate && (!patient.name || !patient.phone || !patient.gender)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (isBillGenerate && patient.selectedTests.length === 0) {
      toast({
        title: 'No Tests Selected',
        description: 'Please select at least one test to generate a bill',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isBillGenerate) {
        // Just show the bill dialog if we're only generating a bill
        setShowBillDialog(true);
        return;
      }
      
      // Prepare patient data with the generated ID
      const patientData = {
        hospitalId: patientId, // The generated SWT-YYMMDD-XX ID
        name: patient.name,
        age: parseInt(patient.age) || 0,
        gender: patient.gender as Gender,
        phone: patient.phone,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        pincode: patient.pincode,
        doctor: patient.doctor,
        registrationDate: new Date(),
        lastVisit: new Date(),
        balance: 0, // Initial balance
        status: 'active' as const,
        tests: patient.selectedTests,
      };
      
      // Save to Firestore
      const savedDocId = await addPatient(patientData);
      
      // Set the document ID for navigation
      setPatientDocId(savedDocId);
      
      // Show success message with the generated patient ID
      toast({
        title: 'Patient registered successfully!',
        description: `Patient ID: ${patientId}`,
        variant: 'default',
      });
      
      // Show bill dialog if tests are selected
      if (patient.selectedTests.length > 0) {
        setShowBillDialog(true);
      } else {
        // Reset form if no tests selected
        resetForm();
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: 'Error',
        description: isBillGenerate ? 'Failed to generate bill. Please try again.' : 'Failed to save patient. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hospital data will be retrieved from context or props

  const handlePrintBill = () => {
    // Create a new window for PDF letterhead with bill overlay
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // Use default hospital data
    const hospital = {
      name: 'SWASTHYA DIAGNOSTIC CENTRE',
      address: 'Near Railway Station, Darbhanga, Bihar - 846004',
      phone: '+91 9473199330',
      email: 'swasthyadiagnostic@gmail.com',
      gstin: '10AABCS1429B1ZX',
      registration: 'Reg. No.: 123456/2023',
      footerNote: 'This is a computer generated bill. No signature required.'
    };

    // Load admin design settings from localStorage to sync with HospitalProfile
    const savedProfileRaw = localStorage.getItem('hospitalProfile');
    const savedProfile = savedProfileRaw ? JSON.parse(savedProfileRaw) : {};
    const primaryColor: string = savedProfile.primaryColor || '#1a365d';
    const fontFamily: string = savedProfile.fontFamily || 'Arial, sans-serif';
    const showLogo: boolean = savedProfile.showLogo !== false; // default true
    const showTagline: boolean = savedProfile.showTagline !== false; // default true
    const showGst: boolean = savedProfile.showGst !== false; // default true
    const logo: string | undefined = savedProfile.logo || undefined;
    const tagline: string | undefined = savedProfile.tagline || undefined;

    // Format date and time in Indian format
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const now = new Date();
    const billContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${patientId || 'Receipt'}</title>
        <style>
          body { 
            font-family: ${fontFamily}; 
            margin: 0; 
            padding: 0; 
            font-size: 12px;
            color: #333;
            position: relative;
            height: 100vh;
          }
          .pdf-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
          }
          .pdf-background iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
          .bill-content {
            position: relative;
            z-index: 1;
            padding: 20px;
            margin-top: 200px; /* Space for PDF letterhead */
            background: transparent;
          }
          .bill-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
            color: #1a365d;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .bill-no {
            text-align: right;
            margin-bottom: 8px;
            font-size: 12px;
          }
          .patient-info, .bill-info { 
            width: 100%; 
            margin-bottom: 10px;
            border-collapse: collapse;
            font-size: 12px;
          }
          .patient-info td, .bill-info td { 
            padding: 6px 8px; 
            border: 1px solid #ddd;
            vertical-align: top;
          }
          .patient-info th, .bill-info th { 
            background-color: #f0f4f8; 
            text-align: left; 
            padding: 8px;
            border: 1px solid #ddd;
            color: #1a365d;
          }
          .tests-table { 
            width: 100%; 
            border-collapse: collapse;
            margin: 10px 0;
            page-break-inside: avoid;
            font-size: 11px;
          }
          .tests-table th { 
            background-color: #f0f4f8; 
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
            color: #1a365d;
          }
          .tests-table td { 
            padding: 6px 8px;
            border: 1px solid #ddd;
            vertical-align: middle;
          }
          .total { 
            text-align: right; 
            font-weight: bold; 
            font-size: 13px;
          }
          .signature {
            margin-top: 60px;
            text-align: right;
            position: relative;
          }
          .signature::before {
            content: "";
            display: block;
            width: 200px;
            border-top: 1px solid #000;
            margin-bottom: 5px;
            position: absolute;
            right: 0;
            top: -10px;
          }
          .payment-info {
            width: 45%;
            float: right;
            margin-top: 10px;
            border: 1px solid #ddd;
            border-collapse: collapse;
            font-size: 12px;
          }
          .payment-info td, .payment-info th {
            padding: 6px 8px;
            border: 1px solid #ddd;
          }
          .payment-info th {
            background-color: #f0f4f8;
            color: #1a365d;
          }
          .terms {
            clear: both;
            margin-top: 20px;
            font-size: 10px;
            line-height: 1.4;
            page-break-inside: avoid;
          }
          .terms ol {
            margin: 5px 0;
            padding-left: 20px;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            opacity: 0.1;
            z-index: -1;
            white-space: nowrap;
            pointer-events: none;
            color: #1a365d;
            font-weight: bold;
          }
          .no-print { display: none; }
          @media print {
            body { 
              width: 100%; 
              margin: 0; 
              padding: 0; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .watermark { display: block !important; }
          }
        </style>
      </head>
      <body>
        <!-- PDF Letterhead Background -->
        <div class="pdf-background">
          <iframe src="/letterheadgreen.pdf" title="Letterhead Background"></iframe>
        </div>

        <!-- Watermark -->
        <div class="watermark" style="display: none;">${hospital.name}</div>

        <div class="bill-content">
          <!-- Bill Title -->
          <div class="bill-title">PATIENT BILL / RECEIPT</div>

          <!-- Bill Info -->
          <div class="bill-no">
            <strong>Bill No.:</strong> ${patientId || 'N/A'} | 
            <strong>Date:</strong> ${formatDate(now)} | 
            <strong>Time:</strong> ${formatTime(now)}
          </div>

          <!-- Patient Info -->
          <table class="patient-info">
            <tr>
              <th colspan="4" style="background-color: #1a365d; color: white; text-align: center;">PATIENT DETAILS</th>
            </tr>
            <tr>
              <td width="25%"><strong>Patient Name:</strong></td>
              <td width="25%">${patient.name || 'N/A'}</td>
              <td width="25%"><strong>Age/Gender:</strong></td>
              <td width="25%">${patient.age || 'N/A'} Y / ${patient.gender || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong></td>
              <td>${patient.phone || 'N/A'}</td>
              <td><strong>Referred By:</strong></td>
              <td>${patient.doctor || 'Self'}</td>
            </tr>
            <tr>
              <td><strong>Address:</strong></td>
              <td colspan="3">
                ${patient.address || 'N/A'} 
                ${patient.city ? ', ' + patient.city : ''} 
                ${patient.state ? ', ' + patient.state : ''} 
                ${patient.pincode ? ' - ' + patient.pincode : ''}
              </td>
            </tr>
          </table>

          <!-- Tests Table -->
          <table class="tests-table">
            <thead>
              <tr>
                <th width="5%" style="text-align: center;">S.No</th>
                <th width="60%">Test Name</th>
                <th width="15%" style="text-align: center;">Category</th>
                <th width="20%" style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${patient.selectedTests.map((testId, index) => {
                const test = demoTests.find(t => t.id === testId);
                return test ? `
                  <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td>${test.name}</td>
                    <td style="text-align: center;">${test.category}</td>
                    <td style="text-align: right;">${test.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ` : '';
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold; padding-right: 15px;">Total Amount:</td>
                <td style="text-align: right; font-weight: bold; border-top: 2px solid #000;">₹${calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align: right; font-size: 10px; padding-right: 15px;">(Inclusive of all applicable taxes)</td>
              </tr>
            </tfoot>
          </table>

          <!-- Payment Info -->
          <table class="payment-info">
            <tr>
              <th colspan="2" style="text-align: center; background-color: #1a365d; color: white;">PAYMENT DETAILS</th>
            </tr>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td style="text-align: right;">₹${calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Discount:</td>
              <td style="text-align: right;">₹0.00</td>
            </tr>
            <tr>
              <td><strong>Net Payable:</strong></td>
              <td style="text-align: right; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; font-weight: bold;">
                ₹${calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr>
              <td>Payment Mode:</td>
              <td style="text-align: right;">Cash</td>
            </tr>
            <tr>
              <td>Amount Paid:</td>
              <td style="text-align: right;">₹${calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><strong>Balance:</strong></td>
              <td style="text-align: right; font-weight: bold;">₹0.00</td>
            </tr>
          </table>

          <!-- Terms and Conditions -->
          <div class="terms">
            <p><strong>Terms & Conditions:</strong></p>
            <ol>
              <li>Please bring this bill at the time of sample collection.</li>
              <li>Report delivery time is subject to test type and sample collection time.</li>
              <li>For any queries, please contact our customer care.</li>
              <li>This is a computer generated bill, no signature required.</li>
            </ol>
            <p style="margin-top: 10px;">
              <strong>Note:</strong> Please check all details at the time of sample collection. The management will not be responsible for any discrepancy later.
            </p>
          </div>

          <div class="signature">
            <p>Authorized Signatory</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="letterhead-footer">
          <p>Thank you for choosing our services. For any queries, please contact us at ${hospital.phone}</p>
          <p>${hospital.footerNote || 'This is a computer generated bill. No signature required.'}</p>
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center; clear: both;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1a365d; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; font-weight: bold;">
            <i class="fa fa-print" style="margin-right: 5px;"></i> Print Bill
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; font-weight: bold;">
            <i class="fa fa-times" style="margin-right: 5px;"></i> Close
          </button>
        </div>
      </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.write(billContent);
    printWindow.document.close();
    
    // Auto-print after content loads
    printWindow.onload = () => {
      // Show print dialog after a short delay to ensure content is rendered
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Show success message
        toast({
          title: "Bill Generated",
          description: "The bill has been prepared for printing.",
          variant: "default",
        });
      }, 500);
    };
  };

  const handleCollectSubmit = async () => {
    try {
      let docId = patientDocId;

      // If patient is not yet saved (e.g., bill generated without save), save now
      if (!docId) {
        if (!patient.name || !patient.gender) {
          toast({
            title: 'Missing Details',
            description: 'Please enter patient name and gender before collecting sample.',
            variant: 'destructive',
          });
          return;
        }

        const patientData = {
          hospitalId: patientId,
          name: patient.name,
          age: parseInt(patient.age) || 0,
          gender: patient.gender as Gender,
          phone: patient.phone,
          address: patient.address,
          city: patient.city,
          state: patient.state,
          pincode: patient.pincode,
          doctor: patient.doctor,
          registrationDate: new Date(),
          lastVisit: new Date(),
          balance: 0 as const,
          status: 'active' as const,
          tests: patient.selectedTests,
        };

        docId = await addPatient(patientData);
        setPatientDocId(docId);
      }

      toast({
        title: 'Collecting Samples',
        description: (
          <div>
            <p>Redirecting to report collection form.</p>
            <p className="mt-1 font-medium">Patient ID: {patientId}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>
        ),
        variant: 'default',
      });

      navigate(`/lab/sample-collection/${docId}`);
    } catch (err) {
      console.error('Failed to navigate to sample collection:', err);
      toast({
        title: 'Error',
        description: 'Could not proceed to sample collection. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-2 sm:px-4 py-4 max-w-[1800px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1 h-8 px-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Patient Registration</h1>
          <div className="w-20"></div> {/* For alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Patient Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg">Patient Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={(e) => handleSubmit(e, false)}>
                  <div className="space-y-4">
                    {/* Row 1 - Name, Age, Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          value={patient.name}
                          onChange={handleInputChange}
                          placeholder="Enter patient's full name"
                          required
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth <span className="text-muted-foreground text-xs">(DD/MM/YYYY)</span></Label>
                        <div className="flex gap-2">
                          <Input
                            id="day"
                            name="day"
                            type="number"
                            min="1"
                            max="31"
                            placeholder="DD"
                            className="w-16 text-center"
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                if (!e.shiftKey) {
                                  document.getElementById('month')?.focus();
                                } else {
                                  // If shift+tab, move to previous field
                                  document.getElementById('name')?.focus();
                                }
                              } else if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById('month')?.focus();
                              }
                            }}
                            onBlur={(e) => {
                              const day = e.target.value.padStart(2, '0');
                              const month = (document.getElementById('month') as HTMLInputElement)?.value.padStart(2, '0') || '01';
                              const year = (document.getElementById('year') as HTMLInputElement)?.value || new Date().getFullYear();
                              const newDate = `${year}-${month}-${day}`;
                              if (day && month && year) {
                                setPatient(prev => ({
                                  ...prev,
                                  dob: newDate,
                                  age: calculateAge(newDate)
                                }));
                              }
                            }}
                          />
                          <span className="flex items-center">/</span>
                          <Input
                            id="month"
                            name="month"
                            type="number"
                            min="1"
                            max="12"
                            placeholder="MM"
                            className="w-16 text-center"
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                if (!e.shiftKey) {
                                  document.getElementById('year')?.focus();
                                } else {
                                  document.getElementById('day')?.focus();
                                }
                              } else if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById('year')?.focus();
                              }
                            }}
                            onBlur={(e) => {
                              const day = (document.getElementById('day') as HTMLInputElement)?.value.padStart(2, '0') || '01';
                              const month = e.target.value.padStart(2, '0');
                              const year = (document.getElementById('year') as HTMLInputElement)?.value || new Date().getFullYear();
                              const newDate = `${year}-${month}-${day}`;
                              if (day && month && year) {
                                setPatient(prev => ({
                                  ...prev,
                                  dob: newDate,
                                  age: calculateAge(newDate)
                                }));
                              }
                            }}
                          />
                          <span className="flex items-center">/</span>
                          <Input
                            id="year"
                            name="year"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            placeholder="YYYY"
                            className="w-20"
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                if (!e.shiftKey) {
                                  document.getElementById('age')?.focus();
                                } else {
                                  document.getElementById('month')?.focus();
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const day = (document.getElementById('day') as HTMLInputElement)?.value.padStart(2, '0') || '01';
                              const month = (document.getElementById('month') as HTMLInputElement)?.value.padStart(2, '0') || '01';
                              const year = e.target.value;
                              const newDate = `${year}-${month}-${day}`;
                              if (day && month && year) {
                                setPatient(prev => ({
                                  ...prev,
                                  dob: newDate,
                                  age: calculateAge(newDate)
                                }));
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          min="0"
                          max="120"
                          value={patient.age}
                          onChange={handleInputChange}
                          placeholder={isDobEmpty() ? 'Enter age' : 'Auto-calculated'}
                          className="w-full"
                          readOnly={!isDobEmpty()}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              document.getElementById('gender-trigger')?.focus();
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Row 2 - Gender, Phone, Referred By */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                        <Select
                          value={patient.gender}
                          onValueChange={(value) => handleSelectChange('gender', value)}
                          required
                        >
                          <SelectTrigger id="gender-trigger" className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={patient.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                          required
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctor">Referred By (Doctor)</Label>
                        <Input
                          id="doctor"
                          name="doctor"
                          value={patient.doctor}
                          onChange={handleInputChange}
                          placeholder="Doctor's name (if any)"
                          className="w-full"
                        />
                      </div>
                    </div>


                    {/* Row 4 - State, City, Pincode */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* State and City fields are now part of the grid */}
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select
                          value={patient.state}
                          onValueChange={(value) => handleSelectChange('state', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select
                          value={patient.city}
                          onValueChange={(value) => handleSelectChange('city', value)}
                          disabled={!patient.state}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={patient.state ? 'Select city' : 'Select state first'} />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.length > 0 ? (
                              cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">
                                {patient.state ? 'No cities available' : 'Select a state first'}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Address (Full width) */}
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <textarea
                        id="address"
                        name="address"
                        value={patient.address}
                        onChange={handleInputChange}
                        placeholder="Enter full address"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                      />
                    </div>
                  </div>

                  {/* Test Selection */}
                  <div className="mt-6 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Select Tests</h3>
                      <div className="relative w-64">
                        <Input
                          placeholder="Search tests..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    {patient.selectedTests.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {patient.selectedTests.map((testId) => {
                          const test = demoTests.find((t) => t.id === testId);
                          if (!test) return null;
                          return (
                            <span
                              key={`chip-${testId}`}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-1 text-xs"
                            >
                              <span className="max-w-[180px] truncate">{test.name}</span>
                              <button
                                type="button"
                                onClick={() => handleTestSelection(testId, false)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                                aria-label={`Remove ${test.name}`}
                                title="Remove"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="border rounded-md h-48 overflow-y-auto p-2">
                      {demoTests
                        .filter(test => 
                          test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.category.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((test) => {
                          // Create a unique key using test.id and index to prevent duplicates
                          const uniqueKey = `test-${test.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                          return (
                            <div key={uniqueKey} className="flex items-center justify-between space-x-2 p-1 hover:bg-muted/50 rounded">
                              <div className="flex items-center space-x-2 flex-1">
                                <Checkbox
                                  id={uniqueKey}
                                  checked={patient.selectedTests.includes(test.id)}
                                  onCheckedChange={(checked) => handleTestSelection(test.id, checked as boolean)}
                                />
                                <label
                                  htmlFor={uniqueKey}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                                >
                                  {test.name}
                                  <span className="text-xs text-muted-foreground block">{test.category}</span>
                                </label>
                              </div>
                              <span className="text-sm font-medium">₹{test.price}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register Patient
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      className="w-full bg-gradient-medical hover:opacity-90"
                      onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
                      disabled={patient.selectedTests.length === 0 || isSubmitting}
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Generate Bill
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Bill Preview */}
          <div className="sticky top-4">
            <Card className="shadow-sm border-0">
              <CardHeader className="p-3 bg-muted/20">
                <CardTitle className="text-sm font-medium">Selected Tests</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {patient.selectedTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tests selected yet. Select tests from the form.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Test List */}
                    <div className="space-y-2">
                      {patient.selectedTests.map(testId => {
                        const test = demoTests.find(t => t.id === testId);
                        if (!test) return null;
                        
                        return (
                          <div key={testId} className="flex justify-between items-center text-sm">
                            <span className="line-clamp-1">{test.name}</span>
                            <span className="font-medium">₹{test.price}</span>
                          </div>
                        );
                      })}
                      <div className="border-t mt-3 pt-2 flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{calculateTotal()}</span>
                      </div>
                    </div>

                    {/* Bill Preview */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Bill Preview</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.print()}
                          className="print:hidden"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Bill
                        </Button>
                      </div>
                      <div className="border rounded-lg overflow-auto bg-white p-4 print:border-0 print:p-0">
                        <div className="w-full print:p-4" style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
                              <InvoiceTemplate
                                template="professional"
                                hospital={{
                                  id: 'demo',
                                  name: 'SWASTHYA DIAGNOSTIC CENTRE',
                                  displayName: 'SWASTHYA DIAGNOSTIC CENTRE',
                                  type: 'diagnostic-center',
                                  registrationNumber: '123456/2023',
                                  gstNumber: '10AABCS1429B1ZX',
                                  address: {
                                    street: 'Near Railway Station',
                                    city: 'Darbhanga',
                                    state: 'Bihar',
                                    pincode: '846004',
                                    country: 'India'
                                  },
                                  phoneNumbers: ['+91 9473199330'],
                                  email: 'swasthyadiagnostic@gmail.com',
                                  logoUrl: '',
                                  settings: {
                                    primaryColor: '#1a365d',
                                    secondaryColor: '#2d3748',
                                    fontFamily: 'Arial, sans-serif',
                                    headerStyle: 'centered',
                                    showLogo: true,
                                    showTagline: true,
                                    showGst: true,
                                    letterHeadEnabled: true,
                                    timezone: 'Asia/Kolkata',
                                    dateFormat: 'DD/MM/YYYY',
                                    currency: 'INR'
                                  },
                                  letterhead: {
                                    logoUrl: '',
                                    showHospitalName: true,
                                    showAddress: true,
                                    showContact: true,
                                    showEmail: true,
                                    showWebsite: false,
                                    showGst: true,
                                    showRegistration: true
                                  },
                                  admin: {
                                    id: 'admin',
                                    name: 'Admin',
                                    email: 'admin@swasthya.com',
                                    phone: '+91 9473199330',
                                    role: 'admin',
                                    createdAt: new Date()
                                  },
                                  isActive: true,
                                  isVerified: true,
                                  isDemo: true,
                                  createdAt: new Date(),
                                  updatedAt: new Date(),
                                  registrationDate: new Date()
                                }}
                                bill={{
                                  id: patientId || 'SWT-250909-01',
                                  patientId: patientId || 'demo',
                                  patientName: patient.name || 'Sample Patient',
                                  tests: patient.selectedTests.map(testId => {
                                    const test = demoTests.find(t => t.id === testId);
                                    return test
                                      ? { id: test.id, name: test.name, price: test.price, category: test.category }
                                      : { id: testId, name: 'Unknown Test', price: 0, category: 'General' };
                                  }),
                                  totalAmount: calculateTotal(),
                                  date: new Date(),
                                  hospitalId: 'demo',
                                  paymentMode: 'Cash'
                                }}
                                patient={{
                                  id: patientId || 'demo',
                                  name: patient.name || 'Sample Patient',
                                  age: parseInt(patient.age) || 25,
                                  gender: (patient.gender as 'Male' | 'Female' | 'Other') || 'Male',
                                  phone: patient.phone || '9999999999',
                                  doctor: patient.doctor || 'Self',
                                  address: patient.address || 'Sample Address',
                                  city: patient.city,
                                  state: patient.state,
                                  pincode: patient.pincode,
                                  testsSelected: patient.selectedTests,
                                  status: 'Bill Printed',
                                  createdAt: new Date()
                                }}
                                withLetterhead={true}
                                headerAlign="center"
                                footerAlign="center"
                              />
                        </div>
                      </div>
                    </div>
                    <style>{`
                      @media print {
                        body * {
                          visibility: hidden;
                        }
                        .print-content, .print-content * {
                          visibility: visible;
                        }
                        .print-content {
                          position: absolute;
                          left: 0;
                          top: 0;
                          width: 100%;
                        }
                      }
                    `}</style>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bill Dialog */}
      <Dialog open={showBillDialog} onOpenChange={(open) => {
        if (!open) {
          // Reset form when dialog is closed
          resetForm();
        }
        setShowBillDialog(open);
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle>Test Details for {patient.name || 'Patient'}</DialogTitle>
                <DialogDescription className="mt-1">
                  Patient ID: {patientId || 'N/A'} | Date: {new Date().toLocaleDateString()}
                </DialogDescription>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-primary">₹{calculateTotal().toFixed(2)}</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Patient Info - compact single row */}
            <div className="rounded-lg border bg-card p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Patient Name</p>
                  <p className="font-medium truncate">{patient.name || 'N/A'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Age / Gender</p>
                  <p className="font-medium truncate">{patient.age || 'N/A'} {patient.gender ? ` / ${patient.gender}` : ''}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Contact</p>
                  <p className="font-medium truncate">{patient.phone || 'N/A'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Referred By</p>
                  <p className="font-medium truncate">{patient.doctor || '-'}</p>
                </div>
              </div>
            </div>

            {/* Test Details */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-3 border-b">
                <h3 className="font-semibold">Test Details</h3>
              </div>
              
              {patient.selectedTests.length > 0 ? (
                <div className="divide-y">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-3 bg-muted/20 font-medium text-sm text-muted-foreground">
                    <div className="col-span-1">#</div>
                    <div className="col-span-6">Test Name</div>
                    <div className="col-span-3 text-center">Category</div>
                    <div className="col-span-2 text-right">Price (₹)</div>
                  </div>
                  
                  {/* Test Items */}
                  {patient.selectedTests.map((testId, index) => {
                    const test = demoTests.find(t => t.id === testId);
                    // Create a unique key using testId and index to prevent duplicates
                    const uniqueKey = `selected-test-${testId}-${index}-${Date.now()}`;
                    return test ? (
                      <div key={uniqueKey} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/10">
                        <div className="col-span-1 text-sm text-muted-foreground">{index + 1}.</div>
                        <div className="col-span-6">
                          <p className="font-medium">{test.name}</p>
                          {test.description && (
                            <p className="text-xs text-muted-foreground mt-1">{test.description}</p>
                          )}
                        </div>
                        <div className="col-span-3 text-sm text-center text-muted-foreground">
                          {test.category}
                        </div>
                        <div className="col-span-2 text-right font-medium">
                          ₹{test.price.toFixed(2)}
                        </div>
                      </div>
                    ) : null;
                  })}
                  
                  {/* Total */}
                  <div className="border-t p-4 bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <p>Total {patient.selectedTests.length} test(s)</p>
                        <p className="text-muted-foreground text-xs">*All prices include GST</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold">₹{calculateTotal().toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No tests selected</p>
                </div>
              )}
            </div>
            
            {/* Additional Notes */}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Notes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Report will be available within 24 hours</li>
                <li>Please bring this receipt when collecting the report</li>
                <li>For any queries, contact: 1800-123-4567</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between border-t pt-4">
            <div className="text-xs text-muted-foreground">
              <p>Thank you for choosing our lab services</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBillDialog(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={handlePrintBill}>
                <Printer className="h-4 w-4 mr-2" />
                Print Bill
              </Button>
              <Button onClick={handleCollectSubmit}>
                <FileText className="h-4 w-4 mr-2" />
                Collect Sample
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRegistration;
