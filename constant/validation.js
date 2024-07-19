


let nameRegex = /^[.a-zA-Z\s]+$/;
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/;
let passRegex =  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;
let statusRegex = /^(success|failed|pending)$/
let adminTypeRegex = /^(Admin|CEO|GM|AGM)$/
let accessRegex = /^(DSM|SM|Sr.Accountant)$/
let productStatusRegex = /^(Active|Inactive)$/
let payoutStatusRegex = /^(Deposite|Pending|Cancel)$/

module.exports = {
  nameRegex,
  phoneRegex,
  emailRegex,
  passRegex,
  statusRegex,
  adminTypeRegex,
  accessRegex,
  productStatusRegex,
  payoutStatusRegex
};
