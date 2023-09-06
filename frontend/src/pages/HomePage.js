import React, {useState, useEffect, useContext} from 'react'
import AuthContext from '../context/AuthContext'
import './HomePage.css'
import { useLocation } from 'react-router-dom'
import TransactionItem from '../components/TransactionItem'

const HomePage = () => {
    let [notes, setNotes] = useState([])
    let {authTokens, logoutTokens} = useContext(AuthContext)
    let {user, logoutUser} = useContext(AuthContext)
    const [loading, setLoading] = useState(false)

    const location = useLocation()
    const currDirection = new URLSearchParams(location.search).get("direction");

    const [balance, setBalance] = useState(null)

    const [clientID, setClientID] = useState(null)
    const [showClientID, setShowClientID] = useState(false)
    const [croppedID, setCroppedID] = useState(null)

    const [totalSupply, setTotalSupply] = useState(null)
    const [showSupply, setShowSupply] = useState(false)

    const [balanceOf, setBalanceOf] = useState(null)
    const [balanceOfAccount, setBalanceOfAccount] = useState(null)
    const [showBalanceOf, setShowBalanceOf] = useState(false)


    const [transferRecipient, setTransferRecipient] = useState(null)
    const [transferAmount, setTransferAmount] = useState(null)
    const [showTransfer, setShowTransfer] = useState(false)
    const [transferStatus, setTransferStatus] = useState(null)

    const [approveSpender, setApproveSpender] = useState(null)
    const [approveValue, setApproveValue] = useState(null)
    const [approveStatus, setApproveStatus ] = useState(null)
    const [showApprove, setShowApprove] = useState(false)

    const [allowanceOwner, setAllowanceOwner] = useState(null)
    const [allowanceSpender, setAllowanceSpender] = useState(null)
    const [allowanceStatus, setAllowanceStatus] = useState(null)
    const [showAllowance, setShowAllowance] = useState(false)

    const [tfFrom, setTfFrom] = useState(null)
    const [tfTo, setTfTo] = useState(null)
    const [tfValue, setTfValue] = useState(null)
    const [tfStatus, setTfStatus] = useState(null)
    const [showTf, setShowTf] = useState(false)

    const [tx, setTx] = useState(null)
    const [txMap, setTxMap] = useState(null)

    const [mail, setMail] = useState(null)

    const [usedBalance, setUsedBalance] = useState(null)

    const [showShowAll, setShowAll] = useState(true)

    const fetchBalance = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=clientAccountBalance`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })
            const data = await response.json()
            setBalance(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchUsedBalance = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=clientAccountUsedBalance`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })
            const data = await response.json()
            setUsedBalance(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchClientID = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=clientAccountID`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })
            const data = await response.json()
            setClientID(data.result)
            setCroppedID(sliceID(data.result))
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchTotalSupply = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=totalSupply`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })
            const data = await response.json()
            setTotalSupply(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchBalanceOf = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=balanceOf%20${balanceOfAccount}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setBalanceOf(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchTransfer = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=transfer%20${transferRecipient}%20${transferAmount}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setTransferStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const fetchApprove = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=approve%20${approveSpender}%20${approveValue}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setApproveStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const fetchAllowance = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=allowance%20${allowanceOwner}%20${allowanceSpender}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setAllowanceStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const fetchTransferFrom = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/query/?cmd=transferFrom%20${tfFrom}%20${tfTo}%20${tfValue}`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setTfStatus(data.result)
        } 
        catch (error) {
            console.log("error", error)
        }
    }

    const fetchTX = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/tx/`, {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + String(authTokens.access)
                }
            })            
            const data = await response.json()
            setTx(data.output)
            console.log(data.output)
            setTxMap(data.output.slice(Math.max(0, data.output.length - 10),data.output.length).reverse().map((value) => {
                return <TransactionItem 
                    Time={value.Timestamp}
                    TransactionID={value.TransactionID} 
                    BlockNumber={value.BlockNumber} 
                    EventName={value.EventName} 
                    From={value.Payload.from} 
                    To={value.Payload.to} 
                    Value={value.Payload.value}/>;
            }));
            setLoading(false);
        } 
        catch (error) {
            console.log("error", error)
            
        }
    }

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
        } 
        catch (error) {
            console.log("error", error)
        }
    };

    const balanceOfAccountHandler = (e) => {
        setBalanceOfAccount(e.target.value);
    }

    const balanceOfHandler = (e) => {
        fetchBalanceOf(balanceOf);
    }

    useEffect(() => {
        
        fetchBalance(); // on first render, refresh
        fetchClientID();
        fetchTotalSupply();
        fetchUsedBalance();
        fetchTX();
        fetchMail();


        const interval = setInterval(() => {
            fetchBalance();
        }, 100000); /* 10000 ten sec*/
        return () => clearInterval(interval);

    }, [])


    const transferRecipientHandler = (e) => {
        setTransferRecipient(e.target.value);
    }
    const transferAmountHandler = (e) => {
        setTransferAmount(e.target.value);
    }

    const transferHandler = async () => {
        try {
            fetchTransfer();
        } catch (error) {
            console.log(error);
        }
    }

    const approveSenderHandler = (e) => {
        setApproveSpender(e.target.value);
    }
    const appoveValueHandler = (e) => {
        setApproveValue(e.target.value);
    }

    const approveHandler = async () => {
        try {
            fetchApprove();
        } catch (error) {
            console.log(error);
        }
    }

    const allowanceOwnerHandler = (e) => {
        setAllowanceOwner(e.target.value);
    }
    const allowanceSpenderHandler = (e) => {
        setAllowanceSpender(e.target.value);
    }
    const allowanceHandler = async () => {
        try {
            fetchAllowance();
        } catch (error) {
            console.log(error);
        }
    }

    const tfFromHandler = (e) => {
        setTfFrom(e.target.value);
    }
    const tfToHandler = (e) => {
        setTfTo(e.target.value);
    }
    const tfValueHandler = (e) => {
        setTfValue(e.target.value);
    }
    const tfHandler = async () => {
        try {
            fetchTransferFrom();
        } catch (error) {
            console.log(error);
        }
    }

    const sliceID = (input) => {
        return input.length > 10 ? `${input.substring(0, 5)}...${input.substring(input.length-5, input.length)}` : input;
    }

    const unsecuredCopyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Unable to copy to clipboard', err);
        }
        document.body.removeChild(textArea);
    }

    const showAll = () => {
        setTxMap(tx.reverse().map((value) => {
            return <TransactionItem 
                Time={value.Timestamp}
                TransactionID={value.TransactionID} 
                BlockNumber={value.BlockNumber} 
                EventName={value.EventName} 
                From={value.Payload.from} 
                To={value.Payload.to} 
                Value={value.Payload.value}/>;
        }));
    }

    return (
      <div className='homeContainer'>
        <div className='dashContainer'>
            <div className='tokenContainer'>
                <p id='balanceTitle'>Carbon Tokens:</p>
                <p id='tokenNumber'>{ balance }</p>
                {/* <p id='tokenUnit'>carbon tokens</p> */}
            </div>
            <div className='supplyContainer'>
                <p id='supplyTitle'>Emission Tokens: </p>
                <p id='supplyDisplay'>{ usedBalance }</p>
            </div>
            <div className='supplyContainer'>
                <p id='supplyTitle'>Total Supply: </p>
                <p id='supplyDisplay'>{ totalSupply }</p>
            </div>
            <div className='idContainer'>
                <p id='idTitle'>Member ID: </p>
                <p id='idDisplay'>{ croppedID }</p>
                <button id='copyButton' 
                    onClick={ () => { 
                        unsecuredCopyToClipboard(clientID);
                        console.log("cl");
                    } }>
                    <i class="fa fa-copy"></i>
                </button>
                <div className='tipCopy'>
                    Copy
                </div>
            </div>
        </div>
        <div className='transactionsContainer'>
            <p id='txTitle'>Recent Transactions</p>
            <li className='colTitle'>
                <span>Time</span>
				<span>Transaction ID</span>
				<span>Event</span>
				<span>From</span>
				<span>To</span>
                <span>Value</span>
			</li>
            { txMap }
            { loading && <div id='loadingIcon' ><i class="fa fa-spinner fa-spin" ></i> </div>}
            {/* { !loading && showShowAll && 
                <li>
                    <button id="showAll" onClick={ () => { 
                        showAll();
                        console.log("show all");
                        setShowAll(false);
                    } }>Show all</button>
                </li>
            } */}
        </div>
      </div>
    )
}

export default HomePage
