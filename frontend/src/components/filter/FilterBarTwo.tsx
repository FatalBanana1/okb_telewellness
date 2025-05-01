import { useState } from 'react';
import ChevronDown from '@/assets/chevron_down';
import SearchBarAdmin from '../SearchBarAdmin';
import Trash from '@/assets/trash.svg';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import okb_colors from '@/colors';

// Updated props interface
interface FilterBarTwoProps {
    onDelete: (userId: string) => void;
    userList: string[];
    onSearch?: (searchTerm: string) => void;
    onAvailabilityChange?: (availability: string) => void;
    onLanguageChange?: (language: string) => void;
    onGenderChange?: (gender: string) => void;
    onStatusChange?: (status: string) => void;
    onFilter?: () => void;
}

const FilterBarTwo = ({ 
    onDelete, 
    userList, 
    onSearch = () => {}, 
    onAvailabilityChange = () => {}, 
    onLanguageChange = () => {}, 
    onGenderChange = () => {}, 
    onStatusChange = () => {},
    onFilter = () => {}
}: FilterBarTwoProps) => {
    const weeklyAvailability = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const languages = ["English", "Ga", "Twi", "Hausa"];
    const genders = ["Male", "Female"];
    const statuses = ["Pending", "Approved"];
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // State to track selected filters
    const [selectedAvailability, setSelectedAvailability] = useState<string>("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [selectedGender, setSelectedGender] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    const handleSearch = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
        onSearch(newSearchTerm);
    };

    const handleAvailabilitySelect = (availability: string) => {
        setSelectedAvailability(availability);
        onAvailabilityChange(availability);
    };

    const handleLanguageSelect = (language: string) => {
        setSelectedLanguage(language);
        onLanguageChange(language);
    };

    const handleGenderSelect = (gender: string) => {
        setSelectedGender(gender);
        onGenderChange(gender);
    };

    const handleStatusSelect = (status: string) => {
        setSelectedStatus(status);
        onStatusChange(status);
    };

    const filter = () => {
        onFilter();
    };

    async function deleteUsers(userIds: string[]) {
        for (const uid of userIds) {
            await deleteDoc(doc(db, "users", uid));
        }
    }

    const handleDeleteUsers = async () => {
        try {
            await deleteUsers(userList);
            onDelete(selectedUserIds[0]); // Assuming onDelete takes a single ID
            setSelectedUserIds([]);
        } catch (error) {
            console.error("Error deleting users:", error);
        }
    };

    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    return (
        <div className="flex flex-row justify-center items-center gap-2 mx-36">
            <div className="Search Name or Title">
                <SearchBarAdmin onSearch={handleSearch} />
            </div>

            {/* <div className="h-12 px-6 py-3 bg-white rounded-lg border border-zinc-600 justify-between items-center inline-flex">
                <div className="dropdown">
                    <label tabIndex={0} className="text-neutral-400 flex gap-25 m-1 text-base font-normal">
                        {selectedAvailability || "Weekly Availability"}<ChevronDown color={okb_colors.med_gray} />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        {weeklyAvailability.map((e) => (
                            <li key={e} onClick={() => handleAvailabilitySelect(e)}>
                                <a className={selectedAvailability === e ? "active" : ""}>{e}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="h-12 px-6 py-3 bg-white rounded-lg border border-zinc-600 justify-between items-center inline-flex">
                <div className="dropdown">
                    <label tabIndex={0} className="text-neutral-400 flex gap-5 m-1 text-base font-normal">
                        {selectedLanguage || "Language"}<ChevronDown color={okb_colors.med_gray} />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        {languages.map((e) => (
                            <li key={e} onClick={() => handleLanguageSelect(e)}>
                                <a className={selectedLanguage === e ? "active" : ""}>{e}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="h-12 px-6 py-3 bg-white rounded-lg border border-zinc-600 justify-between items-center inline-flex">
                <div className="dropdown">
                    <label tabIndex={0} className="text-neutral-400 flex gap-5 m-1 text-base font-normal">
                        {selectedGender || "Gender"}<ChevronDown color={okb_colors.med_gray} />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        {genders.map((e) => (
                            <li key={e} onClick={() => handleGenderSelect(e)}>
                                <a className={selectedGender === e ? "active" : ""}>{e}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div> */}

            <div className="h-12 px-6 py-3 bg-white rounded-lg border border-zinc-600 justify-between items-center inline-flex">
                <div className="dropdown">
                    <label tabIndex={0} className="text-neutral-400 flex gap-5 m-1 text-base font-normal">
                        {selectedStatus || "Status"}<ChevronDown color={okb_colors.med_gray} />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        {statuses.map((e) => (
                            <li key={e} onClick={() => handleStatusSelect(e)}>
                                <a className={selectedStatus === e ? "active" : ""}>{e}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <button 
                className="px-8 py-3 bg-white rounded-2xl border border-sky-700 justify-center items-center gap-2.5 inline-flex" 
                onClick={filter}
            >
                <div className="text-sky-700 text-base font-bold text-center">Filter</div>
            </button>
            <figure className={`cursor-pointer`} onClick={openDeleteModal}>
                <Trash />
            </figure>
            
            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative z-50 bg-white p-8 rounded-lg text-center">
                        <h2 className="text-2xl font-bold mb-4">Are you sure?</h2>
                        <p className="text-gray-600 mb-2">Deleting a user is an action that cannot be undone.</p>
                        <p className="text-gray-600 mb-4">To confirm that you want to remove the selected users, click the delete below.</p>
                        <div className="flex justify-center">
                            <button
                                className="bg-gray-400 text-white px-4 py-2 mr-2 rounded"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={handleDeleteUsers}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FilterBarTwo;