import React from 'react';
import profilePic from '../images/sample_profile_pic.jpg'; // Import the image

/*
This component is used to display profile picture
*/

function ProfilePicture() {
  return (
    <div className="ProfilePicture">
      <img src={profilePic} className='img-thumbnail rounded' alt="" />
    </div>
  );
}

export default ProfilePicture;
