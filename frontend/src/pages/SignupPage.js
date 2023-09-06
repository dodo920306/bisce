import React, { useContext , useEffect, useState} from 'react'
import AuthContext from '../context/AuthContext'
import './SignupPage.css'

const SignupPage = () => {

    let {loginUser} = useContext(AuthContext)
    let {user, logoutUser} = useContext(AuthContext)
    let {signupUser} = useContext(AuthContext)
    // const options = ["Org1", "Org2", "Org3"];
    // const options = ["Org1"];
    
    // const [selected, setSelected] = useState(options[0])
    const [created, setCreated] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)

    const signupHandler = (e) => {
        e.preventDefault()        
        setLoading(true)
        console.log('sign up ' + e.target.username.value)
        if (e.target.username.value == '' || e.target.password.value == '' || e.target.pwdConfirmation.value=='') {
            setErrorMsg('Do not leave empty')
        } else if (e.target.password.value != e.target.pwdConfirmation.value) {
            setErrorMsg('Passwords do not match')
            console.log('pwd: ', e.target.password.value," ", e.target.pwdConfirmation.value)
        }
        else{
            setErrorMsg('')
            signupUser(e)
        }
        
        
    }

    return (
        <div className='signupContainer'>
            <div className='sformContainer'>
                <p>SIGN UP</p>
                <form onSubmit={signupHandler}>
                    <label for="organization">Organization</label>
                    <input type="text" className='textInput' name="organization" placeholder="Enter Organization" />
                    <label for="username">Username</label>
                    <input type="text" className='textInput' name="username" placeholder="Enter Username" />
                    <label for="password">Password</label>
                    <input type="password" className='textInput' name="password" placeholder="Enter Password" />
                    <label for="password">Password Confirmation</label>
                    <input type="password" className='textInput'name="pwdConfirmation" placeholder="Confirm Password" />
                    {/* <input type="button" id='submitButton' value='Create Account' onClick={ e => {signupHandler(e);}}/> */}
                    <p id='errorMsg'>{ errorMsg }</p>
                    <input type="submit" id='createButton' value='Create Account' disabled={loading}/>

                </form>
            </div>
        </div>
    )
}

export default SignupPage