import React from 'react';

const Add = ({ bookTraveller }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = document.forms.addTraveller;
    const passenger = {
      name: form.travellername.value,
      phone: form.travellerphone.value,
    };
    bookTraveller(passenger);
    form.travellername.value = "";
    form.travellerphone.value = "";
  };

  return (
    <form name="addTraveller" onSubmit={handleSubmit}>
      <input type="text" name="travellername" placeholder="Name" />
      <input type="text" name="travellerphone" placeholder="Phone Numbers" />
      <button>Add</button>
    </form>
  );
};

export default Add;
