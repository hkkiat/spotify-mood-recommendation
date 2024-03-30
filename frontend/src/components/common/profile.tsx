import React from 'react';
import ProfilePicture from './profilepicture'; // Import the ProfilePicture component


/*
This component is used to display a user profile with their picture
*/


function UserProfile() {
  // Assuming userProfileData contains the path to the user's profile picture

  return (
    <div className="user-profile">
      {/* Pass the dynamic image path as a prop */}
      <ProfilePicture></ProfilePicture>
      {/* Other user profile information */}
    </div>
  );
}

export default UserProfile;
