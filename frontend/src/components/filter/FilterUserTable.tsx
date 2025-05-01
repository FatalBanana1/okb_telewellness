// FilterUserTable.tsx
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import FilterCard from "./FilterCard";
import { IUser } from "../../../src/schema";

const FilterUserTable = ({ currentRecords, onDelete, selectedUsers }) => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const handleCheckChange = (userId, isChecked) => {
    if (isChecked) {
      setSelectedUserIds((prevSelectedUserIds) => [...prevSelectedUserIds, userId] as never);
      selectedUsers((prevSelectedUserIds) => [...prevSelectedUserIds, userId]);
    } else {
      setSelectedUserIds((prevSelectedUserIds) => prevSelectedUserIds.filter((id) => id !== userId));
      selectedUsers((prevSelectedUserIds) => prevSelectedUserIds.filter((id) => id !== userId));
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* Desktop Header - only show on lg screens and up */}
      <div className="hidden lg:flex items-center mx-36">
        <div className="flex justify-between items-center w-full">
          <div className="w-16"></div> {/* Space for checkbox */}
          <div className="w-1/5 font-bold">Name</div>
          <div className="w-1/5 font-bold">Status</div>
          <div className="w-1/5 font-bold">Email</div>
          <div className="w-1/5 font-bold">Date Created</div>
          <div className="w-1/5 font-bold">Last Active</div>
        </div>
      </div>
      <div className="hidden lg:block bg-black h-0.5 rounded-lg mx-36"></div>

      {/* List of users */}
      <div className="w-full mt-5">
        <div className="grid grid-cols-1 gap-4">
          {currentRecords && currentRecords.map((user, index) => {
            const name = user.name;
            const username = user.email;
            return (
              <div key={index}>
                <FilterCard
                  name={name}
                  username={username}
                  created={"N/A"}
                  active={"N/A"}
                  isChecked={selectedUserIds.includes(user.id as never)}
                  onCheckChange={(isChecked) => handleCheckChange(user.id, isChecked)}
                  user_id={user.uid}
                  status={user.status}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterUserTable;