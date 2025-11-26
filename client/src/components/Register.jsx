import React from 'react'
import './Register.css'

function Register() {
return (
<div className="register-container">
  <h2 className='register-title'>Register</h2>
  <form>
    <div className="register-form">
      <label htmlFor="name">First Name:</label>
      <input type="text" id="name" name="name" required />
      <label htmlFor="surname">Last Name:</label>
      <input type="text" id="surname" name="surname" required />
      <label htmlFor="email">Email:</label>
      <input type="email" id="email" name="email" required />
      <label htmlFor="phone">Phone Number:</label>
      <input type="tel" id="phone" name="phone" required />
      <label htmlFor="password">Password:</label>
      <input type="password" id="password" name="password" required />
      <label htmlFor="confirm-password">Confirm Password:</label>
      <input type="password" id="confirm-password" name="confirm-password" required />
    </div>
    <button className='register-button' type="submit">Register</button>
  </form>
</div>
)
}

export default Register