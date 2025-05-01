import { useState, useEffect } from "react";
import StatusIcon from './StatusIcon';
import { useRouter } from 'next/navigation';
import router from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchPsychiatrist } from "../../../firebase/IPsychiatrist";

const FilterCard = ({ name, username, created, active, isChecked, onCheckChange, user_id, status}) => {
  const {user} = useAuth();
  const handleOnChange = () => {
    onCheckChange(!isChecked);
  };

  const cardStyle = {
    backgroundColor: isChecked ? '#D0DBEA' : 'transparent',
    border: isChecked ? 'sky-700' : 'gray-300'
  };

  function handleGoToProfProfile(psych_uid) {
    router.push({
      pathname: `/${user?.userType}/${user?.uid}/admin_view`,
      query: { psych_uid: psych_uid }
    })
  }

  return (
    <div className="flex items-center mx-36">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center w-full border-solid border-2 rounded-lg py-5 px-6" style={cardStyle}>
        {/* Desktop Layout (lg screens and up) */}
        <div className="hidden lg:flex items-center w-full">
          {/* Checkbox Column */}
          <div className="w-16 flex justify-center">
            <input type="checkbox" className="checkbox" checked={isChecked} onChange={handleOnChange} />
          </div>
          
          {/* Name Column */}
          <div className="w-1/5 pr-2 truncate">{name}</div>
          
          {/* Status & View Profile */}
          <div className="w-1/5 flex items-center space-x-2">
            {status && <StatusIcon status={status} />}
            {status !== "" && (
              <button 
                onClick={() => handleGoToProfProfile(user_id)} 
                className="btn bg-okb-blue border-transparent text-xs md:text-sm px-2 py-1 md:px-4 md:py-2">
                View Profile
              </button>
            )}
          </div>
          
          {/* Email Column */}
          <div className="w-1/5 truncate">{username}</div>
          
          {/* Date Created Column */}
          <div className="w-1/5 truncate">{created}</div>
          
          {/* Last Active Column */}
          <div className="w-1/5 truncate">{active}</div>
        </div>

        {/* Mobile/Tablet Layout (below lg screens) */}
        <div className="lg:hidden w-full space-y-3">
          {/* Name Row */}
          <div className="flex items-center border-b pb-2">
            <div className="w-10">
              <input type="checkbox" className="checkbox" checked={isChecked} onChange={handleOnChange} />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-600">Name: </span>
              <span className="font-medium">{name}</span>
            </div>
          </div>

          {/* Email Row */}
          <div className="flex items-center border-b pb-2">
            <span className="text-sm font-medium text-gray-600 w-24">Email: </span>
            <span className="truncate flex-1">{username}</span>
          </div>

          {/* Status Row */}
          {status && (
            <div className="flex items-center border-b pb-2">
              <span className="text-sm font-medium text-gray-600 w-24">Status: </span>
              <div className="flex items-center space-x-2">
                <StatusIcon status={status} />
                {status !== "" && (
                  <button 
                    onClick={() => handleGoToProfProfile(user_id)} 
                    className="btn bg-okb-blue border-transparent text-xs px-2 py-1">
                    View Profile
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Date Created Row */}
          <div className="flex items-center border-b pb-2">
            <span className="text-sm font-medium text-gray-600 w-24">Created: </span>
            <span>{created}</span>
          </div>

          {/* Last Active Row */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 w-24">Last Active: </span>
            <span>{active}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterCard