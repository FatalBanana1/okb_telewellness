import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp, doc, getDoc, setDoc} from "firebase/firestore";
import chevron_left from "@/assets/chevron_left";
import chevron_right from "@/assets/chevron_right";
import FilterBar from "./FilterBar";

import FilterUserTable from "./FilterUserTable";
import FilterBarTwo from "./FilterBarTwo";
import FilterCard from "./FilterCard";
import { deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { fetchDocumentId } from "../../../firebase/fetchData";

export interface UserType {
    active: Timestamp;
    created: Timestamp;
    name: string;
    patient: boolean;
    username: string;
    id: string;
    status: 'pending' | 'approved' | '';
    email: string; 
    // Additional fields for psychiatrists
    availability?: string;
    language?: string;
    gender?: string;
}

// Function to fetch the psychiatrist's status
const fetchPsychiatristStatus = async (psychiatristUID: string) => {
    const documentId = await fetchDocumentId("psychiatrists", psychiatristUID);
    const docRef = doc(db, "psychiatrists", documentId ?? "");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const status = data.status;
        if (status === "approved" || status === "pending") {
            return status;
        } else {
            console.warn(`Invalid status for psychiatrist with ID: ${psychiatristUID}. Defaulting to 'pending'.`);
            return "pending"; // Default to 'pending' if the status is not valid
        }
    } else {
        console.log(`No such psychiatrist document for ID: ${psychiatristUID}`);
        return "pending"; // Default to 'pending' if the document doesn't exist
    }
};

const FilterUser = () => {
    const [patientView, setPatientView] = useState<boolean>(true);
    const [clientView, setClientView] = useState(true);
    const [psychiatristView, setPsychiatristView] = useState(false);
    const [userData, setUserData] = useState<UserType[]>([]);
    const [filteredUserData, setFilteredUserData] = useState<UserType[]>([]); // State for filtered data
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [numPages, setNumPages] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    
    // Client filter states
    const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('');
    const [selectedClientGender, setSelectedClientGender] = useState<string>('');
    const [selectedCondition, setSelectedCondition] = useState<string>('');

    // Psychiatrist filter states
    const [psychiatristSearchTerm, setPsychiatristSearchTerm] = useState<string>('');
    const [selectedAvailability, setSelectedAvailability] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [selectedPsychiatristGender, setSelectedPsychiatristGender] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    useEffect(() => {
        async function fetchUsers() {
            const userSnapshot = await getDocs(collection(db, "users"));
            const users: UserType[] = userSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    id: data.uid,
                    patient: data.userType !== "psychiatrist",
                    status: data.userType === "patient" ? '' : '',
                    email: data.email || data.username || "", 
                } as UserType;
            });
    
            const patients = users.filter(user => user.patient);
            const psychiatrists = users.filter(user => !user.patient);
    
            if (!clientView) {
                // Fetch psychiatrist statuses
                const psychiatristStatuses = await Promise.all(
                    psychiatrists.map(async (psych) => {
                        const status = await fetchPsychiatristStatus(psych.id);
                        return { ...psych, status };
                    })
                );
    
                setUserData(psychiatristStatuses);
                setFilteredUserData(psychiatristStatuses); // Initialize filtered data
            } else {
                setUserData(patients);
                setFilteredUserData(patients); // Initialize filtered data
            }
    
            setNumPages(Math.ceil((clientView ? patients : psychiatrists).length / recordsPerPage));
        }
    
        fetchUsers();
        // Reset filter states when switching views
        if (clientView) {
            setPsychiatristSearchTerm('');
            setSelectedAvailability('');
            setSelectedLanguage('');
            setSelectedPsychiatristGender('');
            setSelectedStatus('');
        } else {
            setClientSearchTerm('');
            setSelectedAgeGroup('');
            setSelectedClientGender('');
            setSelectedCondition('');
        }
    }, [recordsPerPage, clientView]);
    
    // Apply client filters function
    const applyClientFilters = () => {
        let filtered = userData;
        
        // Apply search filter
        if (clientSearchTerm) {
            filtered = filtered.filter(user => 
                (user.name && user.name.toLowerCase().includes(clientSearchTerm.toLowerCase())) || 
                (user.email && user.email.toLowerCase().includes(clientSearchTerm.toLowerCase())) ||
                (user.username && user.username.toLowerCase().includes(clientSearchTerm.toLowerCase()))
            );
        }
        
        // Apply age group filter
        if (selectedAgeGroup) {
            // Placeholder for age filtering
            // Would need actual age data in user records
        }
        
        // Apply gender filter
        if (selectedClientGender) {
            // Would filter by user.gender when data is available
        }
        
        // Apply condition filter
        if (selectedCondition && selectedCondition !== 'N/A') {
            // Would filter by user.condition when data is available
        }
        
        setFilteredUserData(filtered);
        setCurrentPage(1);
        setNumPages(Math.ceil(filtered.length / recordsPerPage));
    };

    // Apply psychiatrist filters function
    const applyPsychiatristFilters = () => {
        let filtered = userData;
        
        // Apply search filter
        if (psychiatristSearchTerm) {
            filtered = filtered.filter(user => 
                (user.name && user.name.toLowerCase().includes(psychiatristSearchTerm.toLowerCase())) || 
                (user.email && user.email.toLowerCase().includes(psychiatristSearchTerm.toLowerCase())) ||
                (user.username && user.username.toLowerCase().includes(psychiatristSearchTerm.toLowerCase()))
            );
        }
        
        // Apply availability filter
        if (selectedAvailability) {
            // Would filter by user.availability when data is available
            // filtered = filtered.filter(user => user.availability === selectedAvailability);
        }
        
        // Apply language filter
        if (selectedLanguage) {
            // Would filter by user.language when data is available
            // filtered = filtered.filter(user => user.language === selectedLanguage);
        }
        
        // Apply gender filter
        if (selectedPsychiatristGender) {
            // Would filter by user.gender when data is available
            // filtered = filtered.filter(user => user.gender === selectedPsychiatristGender);
        }
        
        // Apply status filter
        if (selectedStatus) {
            filtered = filtered.filter(user => 
                user.status && user.status.toLowerCase() === selectedStatus.toLowerCase()
            );
        }
        
        setFilteredUserData(filtered);
        setCurrentPage(1);
        setNumPages(Math.ceil(filtered.length / recordsPerPage));
    };

    // Handler functions for client filter changes
    const handleClientSearchTermChange = (term: string) => {
        setClientSearchTerm(term);
    };

    const handleAgeGroupChange = (ageGroup: string) => {
        setSelectedAgeGroup(ageGroup);
    };

    const handleClientGenderChange = (gender: string) => {
        setSelectedClientGender(gender);
    };

    const handleConditionChange = (condition: string) => {
        setSelectedCondition(condition);
    };

    // Handler functions for psychiatrist filter changes
    const handlePsychiatristSearchTermChange = (term: string) => {
        setPsychiatristSearchTerm(term);
    };

    const handleAvailabilityChange = (availability: string) => {
        setSelectedAvailability(availability);
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
    };

    const handlePsychiatristGenderChange = (gender: string) => {
        setSelectedPsychiatristGender(gender);
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
    };

    // Pagination logic to calculate currentRecords based on currentPage
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredUserData.slice(indexOfFirstRecord, indexOfLastRecord);
    
    const nextPage = () => {
        if (currentPage < numPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleDeleteUser = (userId) => {
        // Update the user data in the state
        setUserData((prevUserData) => prevUserData.filter((user) => user.id !== userId));
        setFilteredUserData((prevFilteredData) => prevFilteredData.filter((user) => user.id !== userId));
        window.location.reload();
    };

    const handleSelectedUsers = (users) => {
        setSelectedUsers(users);
    };

    const handleClick = () => {
        setPatientView((prevPatientView) => !prevPatientView);
    };

    const handleClientClick = () => {
        setClientView(true);
        setPsychiatristView((prev) => !prev); // Toggle the state of the second button
    };

    const handlePsychiatristClick = () => {
        setClientView((prev) => !prev); // Toggle the state of the first button
        setPsychiatristView(true);
    };  

    return (
        <div className="flex flex-col gap-8">
            <div className="mt-5 mb-5 ml-36">
                <button
                    className={`tab relative ${
                        clientView ? "text-sky-700 border-b-2 border-sky-700" : "text-slate-300 border-b-2 border-slate-300"
                    } text-3xl`}
                    onClick={handleClientClick}
                >
                    <span className="relative z-10 ">Clients</span>
                </button>

                <button
                    className={`tab tab-bordered relative ${
                        psychiatristView ? "text-sky-700 border-b-2 border-sky-700" : "text-slate-300 border-b-2 border-slate-300"
                    } text-3xl`}
                    onClick={handlePsychiatristClick}
                >
                    <span className="relative z-10">Psychiatrists</span>
                </button>
            </div>
            {clientView ? 
                <FilterBar 
                    onDelete={handleDeleteUser} 
                    userList={selectedUsers} 
                    onSearch={handleClientSearchTermChange}
                    onAgeGroupChange={handleAgeGroupChange}
                    onGenderChange={handleClientGenderChange}
                    onConditionChange={handleConditionChange}
                    onFilter={applyClientFilters}
                /> : 
                <FilterBarTwo 
                    onDelete={handleDeleteUser} 
                    userList={selectedUsers}
                    onSearch={handlePsychiatristSearchTermChange}
                    onAvailabilityChange={handleAvailabilityChange}
                    onLanguageChange={handleLanguageChange}
                    onGenderChange={handlePsychiatristGenderChange}
                    onStatusChange={handleStatusChange}
                    onFilter={applyPsychiatristFilters}
                />
            }
            <FilterUserTable currentRecords={currentRecords} onDelete={handleDeleteUser} selectedUsers={(users) => handleSelectedUsers(users)} />
            <div className="pagination flex items-center m-auto">
                <div className="flex mb-5">
                    <button className="" onClick={prevPage}>
                        {chevron_left}
                    </button>
                    <div className="border-2 border-solid border-gray-300 px-6">{currentPage}</div>
                    <button className="" onClick={nextPage}>
                        {chevron_right}
                    </button>
                </div>
                <div className="mb-5">Page {currentPage} of {numPages}</div>
            </div>
        </div>
    );
};

export default FilterUser;