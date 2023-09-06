import React, { useContext , useEffect, useState} from 'react'
import AuthContext from '../context/AuthContext'
import './LoginPage.css'
import { Link } from 'react-router-dom'
import { useNavigate  } from 'react-router-dom'
import { GitHubLogin } from 'react-github-login'

const LoginPage = () => {

    let {loginUser} = useContext(AuthContext)
    let {user, logoutUser} = useContext(AuthContext)
    let {authTokens, logoutTokens} = useContext(AuthContext)
    const [mail, setMail] = useState('empty mail')
    const navigate = useNavigate();

    const onSuccess = response => console.log(response);
    const onFailure = response => console.error(response); 

    const fetchMail = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/email`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })
            const data = await response.json()
            setMail(data.email)
            console.log("data: ", data.email)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const submitHandler = (e) => {
        // let un = e.target.username.value
        // if((un == 'org1minter' || un == 'org1admin' || un == 'org1spender' || un == 'org1user1') && selected != 'Org1'){
        //     alert('Username or password incorrect')
        // } else if ((un == 'org2admin' || un == 'org2recipient' || un == 'org2user1') && selected != 'Org2'){
        //     alert('Username or password incorrect')
        // } else if ((un == 'org3admin' || un == 'org3user1') && selected != 'Org3') {
        //     alert('Username or password incorrect')
        // } else {

        loginUser(e);
        console.log('logged in')
            
        // }
    }

    useEffect( () => { 
        fetchMail();
        console.log('use effect user')
    }, [ user ])

    useEffect( () => {    
        chechOrg();
        if(mail=='') {
            logoutUser();
        }
        console.log('use effect email:', mail)
    }, [ mail ])

    const chechOrg = () => {
        if(user){
            console.log(mail)
            // if(mail != `Org1@gmail.com` ){
            //     logoutUser();
            //     setMail('');
            //     console.log('logged our')
            //     alert('Username or password incorrect')
            // }
            // else {
            navigate('/');
            // }
        }
    }
    // useEffect( () => { 

    //     console.log('fetched mail');
    // }, [])

    return (
        <div className='loginContainer'>
            <div className='formContainer'>
                <p>LOGIN</p>
                <form onSubmit={submitHandler}>
                    <label for="organization">Organization</label>
                    <input type="text" className='textInput' name="organization" placeholder="Enter Organization" />
                    <label for="username">Username</label>
                    <input type="text" className='textInput' name="username" placeholder="Enter Username" />
                    <label for="password">Password</label>
                    <input type="password" className='textInput' name="password" placeholder="Enter Password" />
                    <input type="submit" id='submitButton' value='Login'/>
                    <div id='githubLink'> </div>
                    <p id='signupLink'>
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>
                </form>
                {/* <div id='socialLink'>Login with 
                    <button id='github'>Github</button>

                </div> */}
            </div>
        </div>
    )
}

export default LoginPage