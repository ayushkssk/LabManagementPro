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
import { toast } from '@/components/ui/use-toast';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
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
    city: 'Hajipur',
    state: 'Bihar',
    pincode: '',
    selectedTests: [],
    registrationDate: new Date()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicatePatient, setDuplicatePatient] = useState<any>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Recently added tests should appear on top in dropdowns
  const recentTestPriority: string[] = [
    'test-bgt-typt-dot',
    'test-stool-routine',
    'test-hb-bg-rbs',
    'test-bsf-bspp',
    'test-hba1c',
    'test-bsf',
    'test-bspp',
    'test-lipid-profile',
    'test-culture-antibiotic-sensitivity',
    'test-urine-routine',
  ];

  // Handle Enter to behave like Tab within the form (skip textarea and allow submit buttons)
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (!formRef.current) return;
    // Allow Enter in textarea to create new line
    if (target.tagName.toLowerCase() === 'textarea') return;
    // Allow Enter on submit button to submit
    if (target instanceof HTMLButtonElement && target.type === 'submit') return;

    e.preventDefault();

    const focusableSelectors = [
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const focusables = Array.from(
      formRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null);

    const index = focusables.indexOf(target);
    if (index > -1) {
      const next = focusables[index + 1] || focusables[0];
      next.focus();
    }
  };

  // WhatsApp Support launcher
  const handleWhatsAppSupport = () => {
    const phone = '917766866355'; // +91 7766866355 without plus sign for wa.me
    const text = 'IHello, I am using your Lab Management Software and would like some assistance. Could you please help me?';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

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

  // Update cities when state changes, preserve city if valid; default to Hajipur for Bihar
  useEffect(() => {
    if (patient.state) {
      const list = cityByState[patient.state] || [];
      // De-duplicate to avoid duplicate React keys/warnings
      const unique = Array.from(new Set(list));
      setCities(unique);
      setPatient(prev => ({
        ...prev,
        city: prev.city && unique.includes(prev.city)
          ? prev.city
          : (patient.state === 'Bihar' && unique.includes('Hajipur') ? 'Hajipur' : '')
      }));
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
    
    // Handle Full Name - allow only letters and spaces
    if (name === 'name') {
      const sanitized = value.replace(/[^a-zA-Z\s]/g, '');
      setPatient(prev => ({
        ...prev,
        name: sanitized
      }));
      return;
    }
    
    // Handle date fields - allow only digits
    if (['day', 'month', 'year'].includes(name)) {
      // Only allow digits
      const sanitized = value.replace(/\D/g, '');
      // Update the input value
      if (e.target instanceof HTMLInputElement) {
        e.target.value = sanitized;
      }
      return; // Skip further processing as we'll handle dates in onBlur
    }
    
    // Sanitize phone input: allow only digits and limit to 10 characters
    if (name === 'phone') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setPatient(prev => ({
        ...prev,
        phone: sanitized
      }));
      return;
    }
    
    // Sanitize pincode input: allow only digits and limit to 6 characters
    if (name === 'pincode') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setPatient(prev => ({
        ...prev,
        pincode: sanitized
      }));
      return;
    }
    
    // If age is being updated and DOB is empty, allow manual entry
    if (name === 'age' && (isDobEmpty() || !patient.dob)) {
      const sanitized = value.replace(/\D/g, '').slice(0, 3);
      setPatient(prev => ({
        ...prev,
        age: sanitized,
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

  // Check for duplicate patient by phone number
  const checkForDuplicate = async (phone: string) => {
    try {
      const q = query(
        collection(db, 'patients'),
        where('phone', '==', phone)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Return the first matching patient
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      }
      return null;
    } catch (error) {
      console.error('Error checking for duplicate patient:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent, isBillGenerate: boolean = false) => {
    e.preventDefault();
    
    // Check for required fields if not in bill generate mode
    if (!isBillGenerate) {
      if (!patient.name) {
        toast({ title: 'Validation Error', description: 'Please enter patient name', variant: 'destructive' });
        document.getElementById('name')?.focus();
        return;
      }
      if (!patient.phone) {
        toast({ title: 'Validation Error', description: 'Please enter phone number', variant: 'destructive' });
        document.getElementById('phone')?.focus();
        return;
      }
      if (!patient.gender) {
        toast({ title: 'Validation Error', description: 'Please select gender', variant: 'destructive' });
        return;
      }
    }
    
    // Validate date of birth if provided
    if (patient.dob) {
      const [year, month, day] = patient.dob.split('-').map(Number);
      
      // Check for valid date
      const date = new Date(year, month - 1, day);
      const isValidDate = date.getFullYear() === year && 
                         date.getMonth() === month - 1 && 
                         date.getDate() === day;
      
      if (!isValidDate) {
        toast({
          title: 'Invalid Date',
          description: 'Please enter a valid date of birth',
          variant: 'destructive',
        });
        document.getElementById('day')?.focus();
        return;
      }
      
      // Check if date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) {
        toast({
          title: 'Invalid Date',
          description: 'Date of birth cannot be in the future',
          variant: 'destructive',
        });
        document.getElementById('day')?.focus();
        return;
      }
    }
    
    // Validate 10-digit mobile number (numeric only)
    const phoneValid = /^\d{10}$/.test(patient.phone);
    if (!phoneValid) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit mobile number.',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate patient if not in bill generate mode
    if (!isBillGenerate) {
      const existingPatient = await checkForDuplicate(patient.phone);
      if (existingPatient) {
        setDuplicatePatient(existingPatient);
        setShowDuplicateDialog(true);
        return;
      }
    }
    
    // Validate age (0-120) if provided
    if (patient.age) {
      const ageNum = parseInt(patient.age, 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        toast({
          title: 'Invalid Age',
          description: 'Age must be a number between 0 and 120.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // Validate pincode if provided: must be exactly 6 digits
    if (patient.pincode) {
      const pinValid = /^\d{6}$/.test(patient.pincode);
      if (!pinValid) {
        toast({
          title: 'Invalid Pincode',
          description: 'Please enter a valid 6-digit pincode.',
          variant: 'destructive',
        });
        return;
      }
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
      
      // Save patient data
      await savePatientData();
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

  const handleDuplicateConfirm = async (updateExisting: boolean) => {
    setShowDuplicateDialog(false);
    
    if (updateExisting) {
      // Update existing patient
      try {
        await updateDoc(doc(db, 'patients', duplicatePatient.id), {
          lastVisit: new Date(),
          // Add any other fields you want to update
        });
        
        // Set the document ID for navigation
        setPatientDocId(duplicatePatient.id);
        
        // Show bill dialog if tests are selected
        if (patient.selectedTests.length > 0) {
          setShowBillDialog(true);
        } else {
          toast({
            title: 'Patient updated successfully!',
            description: `Patient ID: ${duplicatePatient.hospitalId}`,
            variant: 'default',
          });
          resetForm();
        }
      } catch (error) {
        console.error('Error updating patient:', error);
        toast({
          title: 'Error',
          description: 'Failed to update patient. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      // Continue with new registration
      await savePatientData();
    }
  };

  const savePatientData = async () => {
    try {
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
      throw error; // Re-throw to be caught by the caller
    }
  };

  const handlePrintBill = () => {
    // Create a hidden print container for the bill content
    const printContainer = document.createElement('div');
    printContainer.id = 'print-bill-container';
    printContainer.style.position = 'fixed';
    printContainer.style.top = '-9999px';
    printContainer.style.left = '-9999px';
    printContainer.style.width = '210mm';
    printContainer.style.height = '297mm';
    printContainer.className = 'print-container';

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
      <div class="bill-content" style="position: relative; min-height: 100%; padding-bottom: 50px; margin: 0; padding: 0;">
        <div class="letterhead-header" style="margin: 0; padding: 0; width: 100%;">
          <img src="/letetrheadheader.png" alt="Hospital Letterhead Header" style="width: 100%; height: auto; display: block; margin: 0; padding: 0;">
        </div>
        
        <div class="bill-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 11px;">
          <div class="bill-no">
            <strong>Bill No.: ${patientId || 'SWT-250911-127'}</strong>
          </div>
          <div class="bill-date">
            Date: ${formatDate(now)}
          </div>
          <div class="bill-time">
            Time: ${formatTime(now)}
          </div>
        </div>
        
        <div class="bill-title">PATIENT BILL / RECEIPT</div>
        
        <table class="patient-info">
          <thead>
            <tr><th colspan="4" style="background-color: #4285f4; color: white; text-align: center;">PATIENT DETAILS</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Patient Name:</strong><br>${patient.name || 'N/A'}</td>
              <td><strong>Age/Gender:</strong><br>${patient.age || 'N/A'} Y / ${patient.gender || 'N/A'}</td>
              <td><strong>Phone:</strong><br>${patient.phone || 'N/A'}</td>
              <td><strong>Referred By:</strong><br>${patient.doctor || 'Self'}</td>
            </tr>
            <tr>
              <td colspan="4"><strong>Address:</strong><br>${patient.address || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
        
        <table class="tests-table">
          <thead>
            <tr style="background-color: #4285f4; color: white;">
              <th>S.No</th>
              <th>Test Name</th>
              <th>Category</th>
              <th>Amount (₹)</th>
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
                  <td style="text-align: right;">₹${test.price}</td>
                </tr>
              ` : '';
            }).join('')}
            <tr style="border-top: 2px solid #333;">
              <td colspan="3" class="total"><strong>Total Amount:</strong></td>
              <td class="total"><strong>₹${calculateTotal()}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 15px; font-size: 11px; text-align: center;">
          <em>(Inclusive of all applicable taxes)</em>
        </div>
        
        <table class="bill-info" style="margin-top: 15px;">
          <thead>
            <tr><th colspan="2" style="background-color: #4285f4; color: white; text-align: center;">PAYMENT DETAILS</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Total Amount:</strong> ₹${calculateTotal()}</td>
              <td><strong>Payment Mode:</strong> Cash</td>
            </tr>
            <tr>
              <td><strong>Discount:</strong> ₹0.00</td>
              <td><strong>Amount Paid:</strong> ₹${calculateTotal()}</td>
            </tr>
            <tr>
              <td><strong>Net Payable:</strong> ₹${calculateTotal()}</td>
              <td><strong>Balance:</strong> ₹0.00</td>
            </tr>
          </tbody>
        </table>
        
        
        <div style="margin-top: 100px;"></div>
        <div class="terms-container" style="margin: 10px 0 5px 0; font-size: 9px; line-height: 1.3;">
          <div style="margin-bottom: 5px;"><strong>Terms & Conditions:</strong></div>
          <ol style="margin: 0 0 5px 0; padding-left: 15px;">
            <li>Please bring this bill at the time of sample collection.</li>
            <li>Report delivery time is subject to test type and sample collection time.</li>
            <li>For any queries, please contact our customer care.</li>
            <li>This is a computer generated bill, no signature required.</li>
          </ol>
          <p style="margin: 0;"><strong>Note:</strong> Please check all details at the time of sample collection. The management will not be responsible for any discrepancy later.</p>
        </div>
        
        <div class="footer" style="text-align: right; margin: 5px 0 10px 0; padding: 0;">
          <p style="margin: 0;"><strong>Authorized Signature</strong></p>
        </div>
        
        <div class="letterhead-footer" style="position: absolute; bottom: 0; left: 0; width: 100%; margin: 0; padding: 0;">
          <img src="/letetrheadfooter.png" alt="Hospital Letterhead Footer" style="width: 100%; height: auto; display: block; margin: 0; padding: 0;">
        </div>
      </div>
    `;

    // Add the print container to the document
    printContainer.innerHTML = billContent;
    document.body.appendChild(printContainer);
    
    // Create and add print styles (optimized)
    const printStyles = document.createElement('style');
    printStyles.id = 'print-bill-styles';
    printStyles.media = 'print'; // Only apply styles when printing
    printStyles.textContent = `
      @page {
        size: A4;
        margin: 0 !important;
        padding: 0 !important;
        
        /* Completely remove all headers and footers */
        @top-left { content: "" !important; display: none !important; }
        @top-center { content: "" !important; display: none !important; }
        @top-right { content: "" !important; display: none !important; }
        @bottom-left { content: "" !important; display: none !important; }
        @bottom-center { content: "" !important; display: none !important; }
        @bottom-right { content: "" !important; display: none !important; }
        
        /* Chrome/Safari specific */
        -webkit-margin-before: 0 !important;
        -webkit-margin-after: 0 !important;
        -webkit-margin-start: 0 !important;
        -webkit-margin-end: 0 !important;
      }
      
      /* Firefox specific page rules */
      @-moz-document url-prefix() {
        @page {
          margin: 0 !important;
          size: A4;
        }
      }
      
      @media print {
        /* Completely hide everything first */
        * {
          visibility: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100% !important;
          overflow: hidden !important;
          background: white !important;
        }
        
        /* Show only the print container and its children */
        #print-bill-container, 
        #print-bill-container * {
          visibility: visible !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
        }
        #print-bill-container {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          font-family: Arial, sans-serif !important;
          font-size: 12px !important;
          color: #000 !important;
          background: white !important;
          overflow: hidden;
        }
        .bill-content {
          width: 100% !important;
          min-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          position: relative;
        }
        .hospital-info h1 {
          font-size: 18px !important;
          margin: 0 0 5px 0 !important;
          text-align: center !important;
          color: #1a365d !important;
        }
        .hospital-info p {
          margin: 2px 0 !important;
          text-align: center !important;
          font-size: 11px !important;
        }
        .bill-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          margin-bottom: 10px !important;
        }
        .bill-no {
          text-align: right !important;
          font-size: 10px !important;
        }
        .bill-title {
          text-align: center !important;
          font-size: 16px !important;
          font-weight: bold !important;
          margin: 10px 0 !important;
          text-transform: uppercase !important;
        }
        .patient-info, .bill-info, .tests-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 8px 0 !important;
        }
        .patient-info th, .bill-info th, .tests-table th {
          background-color: #4285f4 !important;
          color: white !important;
          padding: 6px !important;
          border: 1px solid #000 !important;
          font-size: 11px !important;
        }
        .patient-info td, .bill-info td, .tests-table td {
          padding: 4px 6px !important;
          border: 1px solid #000 !important;
          font-size: 10px !important;
        }
        .total {
          text-align: right !important;
          font-weight: bold !important;
        }
        .terms-container {
          margin: 10px 0 !important;
          font-size: 9px !important;
          line-height: 1.3 !important;
        }
        .footer {
          margin: 15px 0 10px 0 !important;
          text-align: right !important;
          font-size: 11px !important;
          padding: 0 !important;
          border: none !important;
        }
        .letterhead-header {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          text-align: center !important;
          position: relative;
          left: 0;
          right: 0;
        }
        .letterhead-header img {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .letterhead-footer {
          position: absolute !important;
          bottom: 0 !important;
          left: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          text-align: center !important;
        }
        .letterhead-footer img {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(printStyles);
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        // Print immediately without additional delays
        window.print();
        
        // Clean up after printing is done or after a short delay
        const cleanup = () => {
          if (document.body.contains(printContainer)) {
            document.body.removeChild(printContainer);
          }
          if (printStyles.parentNode) {
            document.head.removeChild(printStyles);
          }
          // Remove the event listener after cleanup
          window.removeEventListener('afterprint', cleanup);
        };
        
        // Handle cleanup after print dialog is closed
        window.addEventListener('afterprint', cleanup);
        // Fallback cleanup in case afterprint doesn't fire
        setTimeout(cleanup, 1000);
      }, 50); // Reduced initial delay
    });
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
    <div className="patient-registration-page h-screen w-full bg-background overflow-hidden m-0 p-0">
      <div className="h-full flex flex-col px-4 py-2 max-w-full m-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1 h-8 px-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Patient Registration</h1>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleWhatsAppSupport}
              className="h-8 px-3 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
              title="WhatsApp Support"
            >
              {/* Simple WA glyph using text to avoid extra icon dependency */}
              <span className="mr-2">🟢</span>
              WhatsApp Support
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Patient Form */}
          <div className="flex-1 min-w-0 overflow-auto">
            <Card className="shadow-sm border-0 h-full">
              <CardHeader className="p-3 border-b">
                <CardTitle className="text-lg">Patient Details</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <form ref={formRef} onKeyDown={handleFormKeyDown} onSubmit={(e) => handleSubmit(e, false)}>
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
                          pattern="[A-Za-z\s]+"
                          title="Please enter only letters and spaces"
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
                            type="text"
                            maxLength={2}
                            placeholder="DD"
                            className="w-16 text-center"
                            inputMode="numeric"
                            pattern="(0[1-9]|[12][0-9]|3[01])"
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                if (!e.shiftKey) {
                                  document.getElementById('month')?.focus();
                                } else {
                                  document.getElementById('name')?.focus();
                                }
                              } else if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById('month')?.focus();
                              }
                            }}
                            onBlur={(e) => {
                              let day = e.target.value.padStart(2, '0');
                              // Validate day range (1-31)
                              const dayNum = parseInt(day, 10) || 1;
                              day = Math.min(31, Math.max(1, dayNum)).toString().padStart(2, '0');
                              
                              const month = (document.getElementById('month') as HTMLInputElement)?.value.padStart(2, '0') || '01';
                              const year = (document.getElementById('year') as HTMLInputElement)?.value || new Date().getFullYear();
                              const newDate = `${year}-${month}-${day}`;
                              
                              // Update the input value with validated day
                              e.target.value = day;
                              
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
                            type="text"
                            maxLength={2}
                            placeholder="MM"
                            className="w-16 text-center"
                            inputMode="numeric"
                            pattern="(0[1-9]|1[0-2])"
                            onChange={handleInputChange}
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
                              let month = e.target.value.padStart(2, '0');
                              // Validate month range (1-12)
                              const monthNum = parseInt(month, 10) || 1;
                              month = Math.min(12, Math.max(1, monthNum)).toString().padStart(2, '0');
                              
                              const day = (document.getElementById('day') as HTMLInputElement)?.value.padStart(2, '0') || '01';
                              const year = (document.getElementById('year') as HTMLInputElement)?.value || new Date().getFullYear();
                              const newDate = `${year}-${month}-${day}`;
                              
                              // Update the input value with validated month
                              e.target.value = month;
                              
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
                            type="text"
                            maxLength={4}
                            placeholder="YYYY"
                            className="w-20"
                            inputMode="numeric"
                            pattern="(19|20)\d{2}"
                            onChange={handleInputChange}
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
                              let year = e.target.value;
                              // Validate year range (1900-current year)
                              const currentYear = new Date().getFullYear();
                              const yearNum = parseInt(year, 10) || currentYear;
                              year = Math.min(currentYear, Math.max(1900, yearNum)).toString();
                              
                              const day = (document.getElementById('day') as HTMLInputElement)?.value.padStart(2, '0') || '01';
                              const month = (document.getElementById('month') as HTMLInputElement)?.value.padStart(2, '0') || '01';
                              const newDate = `${year}-${month}-${day}`;
                              
                              // Update the input value with validated year
                              e.target.value = year;
                              
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
                          inputMode="numeric"
                          pattern="\\d{1,3}"
                          maxLength={3}
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
                          placeholder="Enter 10-digit mobile number"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          minLength={10}
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              document.getElementById('state-trigger')?.focus();
                            } else if (e.key === 'Tab' && !e.shiftKey) {
                              e.preventDefault();
                              document.getElementById('state-trigger')?.focus();
                            }
                          }}
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
                          <SelectTrigger
                            id="state-trigger"
                            className="w-full"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById('city-trigger')?.focus();
                              } else if (e.key === 'Tab' && !e.shiftKey) {
                                e.preventDefault();
                                document.getElementById('city-trigger')?.focus();
                              }
                            }}
                          >
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
                          <SelectTrigger
                            id="city-trigger"
                            className="w-full"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById('pincode')?.focus();
                              } else if (e.key === 'Tab' && !e.shiftKey) {
                                e.preventDefault();
                                document.getElementById('pincode')?.focus();
                              }
                            }}
                          >
                            <SelectValue placeholder={patient.state ? 'Select city' : 'Select state first'} />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.length > 0 ? (
                              cities.map((city, idx) => (
                                <SelectItem key={`${city}-${idx}`} value={city}>
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
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          type="tel"
                          value={patient.pincode}
                          onChange={handleInputChange}
                          placeholder="Enter 6-digit pincode"
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          minLength={6}
                          className="w-full"
                        />
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
                        .filter(test => {
                          const q = (searchQuery || '').trim().toLowerCase();
                          if (!q) return true;
                          return (
                            test.name.toLowerCase().includes(q) ||
                            test.category.toLowerCase().includes(q) ||
                            test.id.toLowerCase().includes(q)
                          );
                        })
                        .sort((a, b) => {
                          const ia = recentTestPriority.indexOf(a.id);
                          const ib = recentTestPriority.indexOf(b.id);
                          const aPr = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
                          const bPr = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
                          if (aPr !== bPr) return aPr - bPr;
                          return a.name.localeCompare(b.name);
                        })
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

          {/* Tests & Bill Summary */}
          <div className="w-80 min-w-0 overflow-auto">
            <Card className="shadow-sm border-0 h-full">
              <CardHeader className="p-3 border-b">
                <CardTitle className="text-lg">Tests & Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {patient.selectedTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tests selected yet. Select tests from the form.
                  </p>
                ) : (
                  <>
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
                    <div className="border rounded-lg overflow-visible bg-white p-4 print:border-0 print:p-0 max-w-full">
                      <div className="w-full max-w-full print:p-4" style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <style>{`
        .hidden, .no-print {
          display: none !important;
        }
        .patient-registration-page * {
          box-sizing: border-box;
        }
        .patient-registration-page {
          height: 100vh !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
        body, html {
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Remove any bottom elements */
        .patient-registration-page::after,
        .patient-registration-page::before {
          display: none !important;
        }
      `}</style>

      {/* Bill Dialog */}
      <Dialog open={showBillDialog} onOpenChange={(open) => {
        if (!open) {
          // Reset form when dialog is closed
          resetForm();
        }
        setShowBillDialog(open);
      }}>
        <DialogContent 
          className="sm:max-w-[800px]"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
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

      {/* Duplicate Patient Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicate Patient Found</DialogTitle>
            <DialogDescription>
              A patient with the phone number {patient.phone} already exists:
              <div className="mt-2 p-3 bg-gray-100 rounded-md">
                <p><strong>Name:</strong> {duplicatePatient?.name}</p>
                <p><strong>Patient ID:</strong> {duplicatePatient?.hospitalId}</p>
                <p><strong>Last Visit:</strong> {duplicatePatient?.lastVisit?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
              </div>
              <p className="mt-3">Would you like to update the existing record or create a new one?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => handleDuplicateConfirm(true)}
            >
              Update Existing
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleDuplicateConfirm(false)}
            >
              Create New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRegistration;
