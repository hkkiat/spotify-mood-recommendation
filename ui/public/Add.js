"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var Add = function Add(_ref) {
  var bookTraveller = _ref.bookTraveller;
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    var form = document.forms.addTraveller;
    var passenger = {
      name: form.travellername.value,
      phone: form.travellerphone.value
    };
    bookTraveller(passenger);
    form.travellername.value = "";
    form.travellerphone.value = "";
  };
  return /*#__PURE__*/React.createElement("form", {
    name: "addTraveller",
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "travellername",
    placeholder: "Name"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "travellerphone",
    placeholder: "Phone Numbers"
  }), /*#__PURE__*/React.createElement("button", null, "Add"));
};
var _default = exports.default = Add;